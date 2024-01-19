#!/bin/bash
# FTP server details
FTP_HOST="sftp://ftp.hoening.de"
FTP_USERNAME="438742-tsimvris"
FTP_PASSWORD="mf\$vfvsfZx2n"

# Local directory where your files are located
LOCAL_DIR="./shots"

# Remote directory on the FTP server
REMOTE_DIR="/kunden/438742_04838/webseiten/hoening-de/live/wordpress/de/dashboard/"

# Connect to FTP server and upload files
lftp -e "open -u $FTP_USERNAME,$FTP_PASSWORD $FTP_HOST; mirror -R $LOCAL_DIR $REMOTE_DIR; quit"
