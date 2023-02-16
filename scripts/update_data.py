import datetime
import os
import time
import pandas as pd
from ebaysdk.finding import Connection as Finding
from ebaysdk.exception import ConnectionError
import dotenv
import calendar
import sqlite3
import boto3
import requests

APPLICATION_ID = dotenv.get_key(dotenv_path='.env', key_to_get='EBAY_APP_ID')
PAYLOAD = {
    'keywords': 'serial experiments lain plush',
}
DB_PATH = dotenv.get_key(dotenv_path='.env', key_to_get='DB_CONNECTION_STRING')


def get_active_plushes(payload=PAYLOAD):
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


def update_data(db_path):
    '''
    Parse the active listings. Add any new active listings
    to the database. Update any existing listings in case of
    price changes (auctions). Upload listing cover image to S3.
    '''

    new_listings = 0
    con = sqlite3.connect(db_path)
    response = get_active_plushes()

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
        # Add entry
        if con.execute(f'SELECT * FROM LainPlush WHERE id = {item.itemId}').fetchone() is None:
            print(f' [+] Adding {item.title} to db')
            
            # download ebay thumbnail
            img = requests.get(LainPlush['image']).content
            with open(f'{item.itemId}.jpg', 'wb') as f:
                f.write(img)

            # upload to s3 using boto3 with credentials in .env
            boto = boto3.Session(
                aws_access_key_id=dotenv.get_key(dotenv_path='.env', key_to_get='AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=dotenv.get_key(dotenv_path='.env', key_to_get='AWS_SECRET_ACCESS_KEY'),
            )
            s3 = boto.resource('s3')
            bucket = s3.Bucket('lain-plush')
            bucket.upload_file(f'{item.itemId}.jpg', f'{item.itemId}.jpg', ExtraArgs={ "ContentType": "image/jpeg"})
            print(f' [+] Uploaded {item.itemId}.jpg to s3')

            # get s3 url
            LainPlush['image'] = f'https://lain-plush.s3.amazonaws.com/{item.itemId}.jpg'

            # add to db
            con.execute(f'INSERT INTO LainPlush VALUES ({LainPlush["id"]}, {LainPlush["active"]}, "{LainPlush["title"]}", {LainPlush["endTime"]}, {LainPlush["watchCount"]}, {LainPlush["currentPrice"]}, "{LainPlush["url"]}", "{LainPlush["image"]}")')
            sql = '''
            INSERT OR IGNORE INTO LainPlush VALUES (
                :id,
                :active,
                :title,
                :endTime,
                :watchCount,
                :currentPrice,
                :url,
                :image
            )
            '''
            cur = con.cursor()
            cur.execute(sql, LainPlush)

            # delete local file
            os.remove(f'{item.itemId}.jpg')
            new_listings += 1

        # Update entry if price changed
        else:
            # check if price changed
            current_price = con.execute(f'SELECT currentPrice FROM LainPlush WHERE id = {item.itemId}').fetchone()[0]
            if current_price != LainPlush['currentPrice']:
                print(f' [-] Price changed for {item.title} from {current_price} to {LainPlush["currentPrice"]}')
                # update db
                con.execute(f'UPDATE LainPlush SET currentPrice = {LainPlush["currentPrice"]} WHERE id = {item.itemId}')

    con.commit()


def check_expired(db_path):
    '''
    Checks if any listings have expired and marks
    them as inactive.
    '''
    con = sqlite3.connect(db_path)
    # Check if any listings have expired
    for row in con.execute('SELECT * FROM LainPlush'):
        if row[3] < calendar.timegm(datetime.datetime.utcnow().timetuple()):
            print(f' [-] Listing {row[2]} has expired')
            con.execute(f'UPDATE LainPlush SET active = False WHERE id = {row[0]}')

    con.commit()


if __name__ == '__main__':
    # update every 15 minutes
    while True:
        print('Updating data at ', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        try:
            update_data(DB_PATH)
            check_expired(DB_PATH)
        except Exception as e:
            print(e)
        time.sleep(900)
