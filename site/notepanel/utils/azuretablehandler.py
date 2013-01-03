import logging 
from azure.storage import *
 
class AzureTableHandler(logging.Handler): # Inherit from logging.Handler 
    
    table_service = None
    table_name = ''

    def __init__(self, azaccount, azkey, aztable): 
        # run the regular Handler __init__ 
        logging.Handler.__init__(self) 
        self.table_service = TableService(account_name=azaccount, account_key=azkey)
        self.table_name = aztable
        
    def emit(self, log_record): 
        log = Entity()
        log.PartitionKey = log_record.name # logger name
        log.RowKey = datetime.now().isoformat()
        log.level = log_record.levelname
        log.description = log_record.msg        
        self.table_service.insert_entity(self.table_name, log)
        
    def set_proxy(self, host, port):
        self.table_service.set_proxy(host, port)
        
    def create_table(self):
        self.table_service.create_table(table=self.table_name, fail_on_exist=False)
