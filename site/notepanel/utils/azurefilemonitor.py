import os
import logging 
import cStringIO
from azure.storage import *

class AzureFileMonitor(object):
    
    files = []
    directories = []
    account = ''
    key = ''
    container = ''
    blob_service = None
    
    def __init__(self, azaccount, azkey, azcontainer):
        self.setTarget(azaccount, azkey, azcontainer)
    
    def setTarget(self, azaccount, azkey, azcontainer):
        self.account = azaccount
        self.key = azkey
        self.blob_service = BlobService(account_name=azaccount, account_key=azkey)
        self.container = azcontainer
    
    def setProxy(self, host, port):
        self.blob_service.set_proxy(host, port)
    
    def addFile(self, file_path):
        self.files.append(file_path)
    
    def removeFile(self, file_path):
        self.files.remove(file_path)
    
    def addDirectory(self, dir_path):
        self.directories.append(dir_path)
    
    def removeDirectory(self, dir_path):
        self.directories.remove(dir_path)
    
    def clear():
        self.files = []
        self.directories = []    
    
    def copyOneFile(self,file_path):
        file_content = open(file_path, 'r').read()
        file_name = os.path.basename(file_path)
        self.blob_service.put_blob(self.container, file_name, file_content, x_ms_blob_type='BlockBlob')        
    
    # subdirectories are not copied, only files
    def copyAllFilesInDirectory(self, dir_path):
        for file_name in os.listdir(dir_path):
            file_path =  os.path.join(dir_path, file_name)            
            self.copyOneFile(file_path)
        
    def copyAll(self):
        # TODO : check if files are in directories
        for file in self.files:
            self.copyOneFile(file)
        for dir in self.directories:
            self.copyAllFilesInDirectory(dir)
