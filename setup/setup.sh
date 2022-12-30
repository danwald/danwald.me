apt-get update
apt-get upgrade
apt-get install -y curl git nginx ufw openvpn certbot python3-certbot-nginx screen ffmpeg

adduser danwald
addgroup dev
usermod -aG sudo danwald
usermod -aG dev danwald

ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 1022
ufw allow 1194/udp
ufw logging on
ufw status


git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2
echo '. $HOME/.asdf/asdf.sh' >> ~/.bashrc
echo '. $HOME/.asdf/completions/asdf.bash' >> ~/.bashrc
source ~/.bashrc

asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf install nodejs latest
asdf global nodejs latest

echo "Copying over nginx"
cp -v nginx-site.conf /etc/nginx/sites-available/danwald.me
ln -s /etc/nginx/sites-available/danwald.me /etc/nginx/sites-enabled/danwald.me

echo "Creating certs"
certbot --nginx
systemctl status certbot.timer
certbot renew --dry-run
