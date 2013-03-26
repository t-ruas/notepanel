import os
import logging 
import cStringIO
from azure.storage import *


monitors = {}

def getAzureFileMonitor(name):
    if not monitors.has_key(name):
        monitors[name] = AzureFileMonitor()
    return monitors[name]
    


class AzureFileMonitor(object):
    
    files = []
    directories = []
    account = ''
    key = ''
    container = ''
    blob_service = None
       
    def configure(self, azaccount, azkey, azcontainer):
        self.account = azaccount
        self.key = azkey
        self.blob_service = BlobService(account_name=azaccount, account_key=azkey)
        self.container = azcontainer
    
    def set_proxy(self, host, port):
        self.blob_service.set_proxy(host, port)
    
    def add_file(self, file_path):
        self.files.append(file_path)
    
    def remove_file(self, file_path):
        self.files.remove(file_path)
    
    def add_directory(self, dir_path):
        self.directories.append(dir_path)
    
    def remove_directory(self, dir_path):
        self.directories.remove(dir_path)
    
    def clear():
        self.files = []
        self.directories = []    
    
    def copy_one_file(self,file_path):
        file_content = open(file_path, 'r').read()
        file_name = os.path.basename(file_path)
        self.blob_service.put_blob(self.container, file_name, file_content, x_ms_blob_type='BlockBlob')        
    
    # subdirectories are not copied, only files
    def copy_all_files_in_directory(self, dir_path):
        for file_name in os.listdir(dir_path):
            file_path =  os.path.join(dir_path, file_name)            
            self.copy_one_file(file_path)
        
    def copy_all(self):
        # TODO : check if files are in directories
        for file in self.files:
            self.copy_one_file(file)
        for dir in self.directories:
            self.copy_all_files_in_directory(dir)
