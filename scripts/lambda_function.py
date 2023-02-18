import datetime
import json
import os
from ebaysdk.finding import Connection as Finding
from ebaysdk.exception import ConnectionError
from dotenv import load_dotenv
import calendar
import boto3
import requests
import MySQLdb

# load environment variables
load_dotenv()

APPLICATION_ID = os.getenv('EBAY_APP_ID')
PAYLOAD = {
    'keywords': 'serial experiments lain plush',
}
AWS_BUCKET = os.getenv('AWS_BUCKET_NAME')


connection = MySQLdb.connect(
  host= os.getenv('HOST'),
  user= os.getenv('USERNAME'),
  passwd= os.getenv('PASSWORD'),
  db=os.getenv('DATABASE'),
  ssl_mode = "VERIFY_IDENTITY",
  ssl      = {
    "ca": os.getenv('SSL_CERT'),
  }
)


def update_data():
    '''
    Parse the active listings. Add any new active listings
    to the database. Update any existing listings in case of
    price changes (auctions). Upload listing cover image to S3.
    '''

    new_listings = 0
    response = get_active_plushes(PAYLOAD)

    for item in response.reply.searchResult.item:
        if 'plush' not in item.title.lower():
            continue
        LainPlush = {
            'id': getattr(item, 'itemId'),
            'active': True,
            'title': getattr(item, 'title').replace('"', "'"),
            'endTime': calendar.timegm(item.listingInfo.endTime.timetuple()),
            'watchCount': item.listingInfo.watchCount if hasattr(item.listingInfo, 'watchCount') else 0,
            'currentPrice': item.sellingStatus.currentPrice.value,
            'url': getattr(item, 'viewItemURL'),
            'image': getattr(item, 'galleryURL')
        }
        try:
        # Add new entry
            cursor = connection.cursor()
            cursor.execute(f'SELECT * FROM LainPlush WHERE id = {item.itemId}')
            if cursor.fetchone() is None:
                print(f' [+] Adding {item.title} to db')
                
                # download ebay thumbnail
                img = requests.get(LainPlush['image']).content
                with open(f'{item.itemId}.jpg', 'wb') as f:
                    f.write(img)

                # upload to s3 using boto3 with credentials in .env
                boto = boto3.Session(
                    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                )
                s3 = boto.resource('s3')
                bucket = s3.Bucket(AWS_BUCKET)
                bucket.upload_file(f'{item.itemId}.jpg', f'{item.itemId}.jpg', ExtraArgs={ "ContentType": "image/jpeg"})
                print(f' [+] Uploaded {item.itemId}.jpg to s3')

                # add s3 url as image url for listing
                LainPlush['image'] = f'https://{AWS_BUCKET}.s3.amazonaws.com/{item.itemId}.jpg'

                cursor.execute(f'INSERT INTO LainPlush VALUES ({LainPlush["id"]}, {LainPlush["active"]}, "{LainPlush["title"]}", {LainPlush["endTime"]}, {LainPlush["watchCount"]}, {LainPlush["currentPrice"]}, "{LainPlush["url"]}", "{LainPlush["image"]}")')

                os.remove(f'{item.itemId}.jpg')
                new_listings += 1
            # Update entry if price changed
            else:
                # check if price changed
                cursor.execute(f'SELECT currentPrice FROM LainPlush WHERE id = {item.itemId}')
                current_price = cursor.fetchone()[0]
                if current_price != float(LainPlush['currentPrice']):
                    print(f' [-] Price changed for {item.title} from {current_price} to {LainPlush["currentPrice"]}')
                    cursor.execute(f'UPDATE LainPlush SET currentPrice = {LainPlush["currentPrice"]} WHERE id = {item.itemId}')
        except Exception as e:
            print(f' [!] Error: {e}')
            continue
    connection.commit()
    print(f' [+] Added {new_listings} new listings') if new_listings > 0 else print(' [+] No new listings')


def get_active_plushes(payload):
    '''
    Queries the ebay Finding API for any active lain plush
    listings. Note that the response can contain false positives,
    which are handled in update_data.
    '''
    try:
        api = Finding(appid=APPLICATION_ID, config_file=None)
        response = api.execute('findItemsAdvanced', payload)
        return response
    except ConnectionError as e:
        print(e)
        print(e.response.dict())

def check_expired():
    '''
    Checks if any listings have expired and marks
    them as inactive.
    '''
    edited_listings = 0
    
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM LainPlush WHERE active = True')
    active_listings = cursor.fetchall()
    print(f' [+] Checking {len(active_listings)} active listings')

    # Check if any active listings have expired
    for row in active_listings:
        # See if listing's end time has already passed
        if row[3] < calendar.timegm(datetime.datetime.utcnow().timetuple()):
            print(f' [-] Listing {row[2]} has ended')
            cursor.execute(f'UPDATE LainPlush SET active = False WHERE id = {row[0]}')
            edited_listings += 1
    connection.commit()
    print(f' [+] Updated {edited_listings} listings') if edited_listings > 0 else print(' [+] No active listings have ended')

def lambda_handler():
    update_data()
    check_expired()