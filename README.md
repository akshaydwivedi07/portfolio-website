Akshay's Portfolio
==================

A simple portfolio site with a Node.js backend to email contact form submissions.

Setup
-----

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (see example below) with your SMTP details.

3. Start the server:

```bash
npm run start
```

Open `http://localhost:3000`.

.env example
------------

```env
PORT=3000
# recipient email (defaults to akshaydwivedi707@gmail.com if omitted)
TO_EMAIL=akshaydwivedi707@gmail.com

# SMTP configuration (use your provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password_or_app_password
```

For Gmail, enable 2FA and create an App Password.

Notes
-----
- Frontend posts to `/api/contact`.
- CORS is enabled for local use.
- Static files are served from the root directory.





