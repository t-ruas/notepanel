import os
from azure.storage import *
from singleton import *

class AzureFileMonitor(object):
    
    __metaclass__ = Singleton
    files = []
    account = ''
    key = ''
    container = ''
    blob_service = None
    
    def __init__(self):
        pass
    
    def setTarget(self, azaccount, azkey, azcontainer):
        self.account = azaccount
        self.key = azkey
        self.blob_service = BlobService(account_name=azaccount, account_key=azkey)
        self.container = azcontainer
    
    def addFile(self, file_path):
        self.files.append(file_path)
    
    def removeFile(self, file_path):
        self.files.remove(file_path)
    
    def clear():
        self.files = []
    
    def copyOneFile(self,file_path):
        file_content = open(file_path, 'r').read()
        file_name = os.path.basename(file_path)
        self.blob_service.put_blob(self.container, file_name, file_content, x_ms_blob_type='BlockBlob')
        
    def copyAllFiles(self):
        for file in self.files:
            self.copyOneFile(file)
        
    