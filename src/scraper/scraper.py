# Notes to self:
# To scrape links from board, you must first get all the compressed image links from a page
# eg: https://i.pinimg.com/236x/10/92/dc/1092dcdc4f9757c491e0b54cbc5f3880.jpg
# then change the bit after /i.pinimg.com/ to /originals/
# finally the filename will then be either .png, .webp, or .jpg (in general order of frequency)

import sys
import requests
from bs4 import BeautifulSoup

#TODO: make sure input is validated so that atleast it contains https://
#TODO: implement link limits and CLI functionality

debug = False
image_links_limit = 10 #number of image links to pull and return

class PinScraper:
    def __init__(self) -> None:
        self.file_formats = [".png",".jpg",".webp"] #possible file formats for original images
        self.compressed_image_links = []
        self.image_links = []

    #Combines all the functions together to get image links
    def get_images(self, board_url) -> list:
        success = self.get_compressed_image_links(board_url)
        if not success:
            return []

        self.get_original_image_links()
        return self.image_links

    #Gets compressed links from pinterest board and return if operation was successful
    def get_compressed_image_links(self, board_url) -> None:
        if board_url.find("https://www.pinterest.com/") == -1: #make sure url is atleast somewhat correct
            return False
        try:
            page = requests.get(board_url)
        except requests.exceptions.RequestException as e: #https://stackoverflow.com/questions/16511337/correct-way-to-try-except-using-python-requests-module
            return False

        #https://realpython.com/beautiful-soup-web-scraper-python/
        soup = BeautifulSoup(page.content, 'html.parser')
        results = soup.select_one('.gridCentered')
        if not results:
            return False
        
        #tags are pulled in order of their appearance
        #NOTE: tag order is different if logged into pinterest
        tags = results.find_all_next("img")
        self.compressed_image_links = [tag['src'] for tag in tags]

        if debug:
            with open("compressed_links.txt","w+") as f:
                f.write("\n".join(self.compressed_image_links))
                print("Written compressed links to text file")
            
            with open("requested_page.html","wb+") as f:
                print("saved a copy of the requested page")
                f.write(page.content)

        return True
    
    #Goes through each compressed image link and finds original res image
    def get_original_image_links(self):
        for link in self.compressed_image_links:
            #assuming link is formatted like: https://i.pinimg.com/nnnx/{}.jpg
            #change to: https://i.pinimg.com/originals/{} NOTE: also removes filename
            link = link[:21] + "originals/" + link[26:-4] 

            #What this does is append a file format to the url and checks
            #if the page has an xml header? (not actually sure what it is)
            #if it does - url is invalid, if it doesn't, url is on the money :>
            for format in self.file_formats:
                attempt_link = link + format
                page = requests.get(attempt_link)
                xml_header = str(page.content)[:40]
                
                if xml_header != "b'<?xml version=\"1.0\" encoding=\"UTF-8\"?>":
                    self.image_links.append(attempt_link)
                    break
        
        if debug:
            with open("orig_image_links.txt","w+") as f:
                f.write("\n".join(self.image_links))
                print("Written original image links to text file")


    


if __name__ == "__main__":
    scraper = PinScraper()
    links = scraper.get_images(sys.argv[1])
    
    #to interact with nodejs
    for link in links:
        print(link)
    sys.stdout.flush()




