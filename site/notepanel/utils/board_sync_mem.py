import logging
from threading import Lock
from collections import deque

board_version_cache = {}
clients = {}

logger = logging.getLogger("notepanel.utils.board_sync")

def update(board_id, note):
    if board_id not in board_version_cache:
        board_version_cache[board_id] = {"version": 0, "list": deque(maxlen=10), "lock": Lock()}
        logger.debug("board monitor created for board {0}".format(board_id))
    board_version_cache[board_id]["version"] += 1
    update = {"version": board_version_cache[board_id]["version"], "note": note.to_dic()}
    board_version_cache[board_id]["list"].append(update)
    logger.debug("board update for board {0}".format(board_id))
    updates = [update]
    for client in clients.values():
        try:
            client.send_updates(updates)
        except Exception, err:
            logger.error(err)

def get_updates(board_id, version):
    list = []
    logger.debug("polling for board {0} above version {1}".format(board_id, version))
    if board_id in board_version_cache:
        if board_version_cache[board_id]["version"] > version:
            with board_version_cache[board_id]["lock"]:
                for update in board_version_cache[board_id]["list"]:
                    if update.version > version:
                        logger.debug("board update version {0} returned for board {1}".format(update.version, board_id))
                        list.append(update)
    return list
