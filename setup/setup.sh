apt-get update
apt-get upgrade
apt-get install nginx ufw openvpn certbot python3-certbot-apache

ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 1022
ufw allow 1194/udp
ufw status

echo "Copying over nginx"
cp -v nginx-site.conf /etc/nginx/sites-available/danwald.me
ln -s /etc/nginx/sites-available/danwald.me /etc/nginx/sites-enabled/danwald.me

echo "Creating certs"
certbot --nginx
systemctl status certbot.timer
certbot renew --dry-run
