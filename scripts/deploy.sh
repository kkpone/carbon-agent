#!/usr/bin/env bash

################ BRANCH_NAME="dev" ##########
# pre  使用 dev 分支
# prod 使用 master 分支
# 2个分支需要配置单独的环境
################ BRANCH_NAME="dev" #############

PROJECT_NAME="$1"
BRANCH_NAME="$2"

# SERVER_HOST=$PROJECT_NAME$BRANCH_NAME
SERVER_HOST=`echo $PROJECT_NAME-$BRANCH_NAME | sed  -n s/_/-/gp`
echo 'SERVER_HOST is: ----------' $SERVER_HOST
# SERVER_HOST=`echo $PROJECT_NAME-$BRANCH_NAME`

REMOTE_SERVER="192.168.1.67"
#BASE_DIRECTORY="/data/www/carbon_cloud_front"
# BASE_DIRECTORY="/tmp/www/carbon_cloud_front"
# NGINX_DIRECTORY="/tmp/nginx/carbon_cloud_front.d"
NGINX_DIRECTORY="/etc/nginx/carbon_cloud_front.d"

# build project 
# dev & master
pnpm install

echo 'build test' $BRANCH_NAME
npm run test || (echo "command failed"; exit 1);


NGINX_TRYFILES='\$uri \$uri/ /index.html'

nginx_config=`cat << EOF
server {
    listen    80;
    server_name  $SERVER_HOST.carboncloud.com;

    root /data/www/carbon_cloud_front/$SERVER_HOST/build;
    
    location / {
        try_files $NGINX_TRYFILES;
        index    index.html index.htm;

        error_page 404 /index.html;
    }

}
EOF
`

remote_command=`cat <<EOF
if [ ! -d $NGINX_DIRECTORY/$SERVER_HOST -a ! -f $NGINX_DIRECTORY/$SERVER_HOST ]; then
  mkdir -p $NGINX_DIRECTORY \
    && echo "$nginx_config" > $NGINX_DIRECTORY/$SERVER_HOST.conf && nginx -t  && nginx -s reload
  ;
fi
EOF
`

UPDATE_HOST="grep $SERVER_HOST /var/named/carboncloud.com.zone || {  echo $SERVER_HOST    IN  A     192.168.1.67 >>  /var/named/carboncloud.com.zone && systemctl reload named; }" 

# echo $remote_command
echo `pwd`
if [ $BRANCH_NAME = 'dev' ] || [ $BRANCH_NAME = 'master' ]
then
  # 预发布环境、正式环境要单独处理
  echo BRANCH_NAME is $BRANCH_NAME 
else
  # 测试环境、
  echo 'move build file ...'
  scp -r ./build root@$REMOTE_SERVER:/data/www/carbon_cloud_front/$SERVER_HOST
  # nginx
  ssh root@$REMOTE_SERVER $remote_command 
  echo who am i
  # named
  echo $UPDATE_HOST
  # ssh root@$REMOTE_SERVER 
  ssh root@192.168.1.35 $UPDATE_HOST
fi
#ssh root@BRANCH_NAME /xx/xxx/xx/
