import os
import logging 
import cStringIO
from azure.storage import *

log_table = "logs"
table_service = None
log_container = "logs"
blob_service = None

def configure(account_name, account_key):
    global table_service, blob_service
    table_service = TableService(account_name, account_key)
    blob_service = BlobService(account_name, account_key)

def set_proxy(proxy_host, proxy_port):
    table_service.set_proxy(proxy_host, proxy_port)
    blob_service.set_proxy(proxy_host, proxy_port)

def init_storage():
    table_service.create_table(log_table, fail_on_exist=False)

def clear_logs():
    table_service.delete_table(log_table, fail_not_exist=False)

def get_logs(logger_name=None, top="100"):
    if logger_name == None:
        logs = table_service.query_entities(log_table, top="100")
    else:
        filter = "PartitionKey eq '" + logger_name + "'"
        logs = table_service.query_entities(log_table, filter=filter, top="100")
    logs.sort(key=lambda o: o.RowKey, reverse=True)
    return logs

def get_handler():
    return AzureTableHandler(table_service, log_table)

def read_log_file(logger_name):
    blob_name = logger_name + ".log"
    blob = blob_service.get_blob(log_container, blob_name)
    output = cStringIO.StringIO()
    output.write(blob)
    content = output.getvalue()
    output.close()
    return content

class AzureTableHandler(logging.Handler):
    
    table_service = None
    table_name = ""

    def __init__(self, service, table): 
        logging.Handler.__init__(self) 
        self.table_service = service
        self.table_name = table

    def emit(self, log_record): 
        log = Entity()
        log.PartitionKey = log_record.name
        log.RowKey = datetime.now().isoformat()
        log.level = log_record.levelname
        log.description = log_record.msg
        self.table_service.insert_entity(self.table_name, log)
