from azure.storage import *
import cStringIO

class LogService(object):

    log_table = 'logs'    
    table_service = None
    log_container = 'logs'
    blob_service = None
   
    def __init__(self, account_name = None, account_key = None, debug = False):        
        self.table_service = TableService(account_name, account_key)
        self.blob_service = BlobService(account_name, account_key)
        if(debug):
            self.table_service.set_proxy('localhost','3127')
            self.blob_service.set_proxy('localhost','3127')
    
    def clearLogs(self):
        # delete logs table
        self.table_service.delete_table(self.log_table, fail_not_exist=False)
        
    def initLogs(self):
        self.table_service.create_table(self.log_table, fail_on_exist=False)

    def getLogs(self, logger_name=None, top='100'):
        if logger_name == None:
            logs = self.table_service.query_entities(self.log_table, top="100")
        else:
            filter = "PartitionKey eq '" + logger_name + "'"
            logs = self.table_service.query_entities(self.log_table, filter=filter, top="100")
        return logs
    
    def getLogFileContent(self, logger_name):
        blob_name = logger_name + '.log'    
        blob = self.blob_service.get_blob(self.log_container, blob_name)
        output = cStringIO.StringIO()
        output.write(blob)
        content = output.getvalue()
        output.close()
        return content
