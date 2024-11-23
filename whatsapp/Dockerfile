# Menggunakan Node.js sebagai base image
FROM node:16

# Mengatur direktori kerja dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json
COPY package*.json ./

# Menginstal dependensi npm
RUN npm install

# Menyalin semua file proyek ke dalam container
COPY . .

# Mengekspos port 3030 untuk Express
EXPOSE 3030

# Menjalankan aplikasi dengan npm start
CMD ["npm", "start"]
