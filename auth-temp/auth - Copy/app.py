from flask import Flask, redirect, url_for, session, render_template, request, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from flask_mail import Mail, Message
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
import requests
import os
import random
import string
import base64
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder="templates")
app.secret_key = os.getenv("SECRET_KEY", "dev_secret_key")

# Flask-Mail configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)

# Flask-Login setup
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Mock User Model (Replace with DB in production)
class User(UserMixin):
    def __init__(self, id_, email, name):
        self.id = id_
        self.email = email
        self.name = name


# Google OAuth Config
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5000/callback")

# OTP storage (in production, use Redis or database)
otp_storage = {}

def generate_otp(length=6):
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def get_logo_base64():
    """Load and encode the STOCKMASTER logo"""
    try:
        logo_path = os.path.join(app.root_path, 'static', 'images', 'stockmaster_logo.png')
        with open(logo_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
            return f"data:image/png;base64,{encoded_string}"
    except FileNotFoundError:
        print(f"Logo file not found at {logo_path}")
        return None

def send_otp_email(email, otp):
    """Send OTP to user's email"""
    try:
        html_body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0066cc; font-size: 36px; margin: 0;">STOCKMASTER</h1>
                    </div>
                    <h2 style="color: #2c3e50; margin-bottom: 20px;">Dear User,</h2>
                    <p style="font-size: 16px;">Your One-Time Password (OTP) for accessing your <strong>STOCKMASTER</strong> account is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; background-color: #e8f5e9; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; color: #34A853; letter-spacing: 5px;">{otp}</span>
                    </div>
                    <p style="font-size: 16px;">This OTP is valid for the next <strong>5 minutes</strong> and can be used only once.</p>
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px;"><strong>⚠️ Security Notice:</strong> For your security, please do not share this code with anyone under any circumstances — including individuals claiming to be from customer support or the <strong>STOCKMASTER</strong> team.</p>
                    </div>
                    <p style="font-size: 14px; color: #666;">If you did not request this code, please ignore this message and consider securing your account immediately.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message from STOCKMASTER. Please do not reply to this email.</p>
                </div>
            </body>
        </html>
        '''

        
        text_body = f'''Dear User,

Your One-Time Password (OTP) for accessing your STOCKMASTER account is: {otp}.

This OTP is valid for the next 5 minutes and can be used only once.

For your security, please do not share this code with anyone under any circumstances — including individuals claiming to be from customer support or the STOCKMASTER team.

If you did not request this code, please ignore this message and consider securing your account immediately.
'''
        
        msg = Message(
            subject='Your OTP Code - STOCKMASTER',
            recipients=[email],
            body=text_body,
            html=html_body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@login_manager.user_loader
def load_user(user_id):
    user_data = session.get("user")
    if user_data and user_data.get("id") == user_id:
        return User(user_data["id"], user_data["email"], user_data["name"])
    return None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login():
    flow = Flow.from_client_config(
        client_config={
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://accounts.google.com/o/oauth2/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI],
            }
        },
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    flow = Flow.from_client_config(
        client_config={
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://accounts.google.com/o/oauth2/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI],
            }
        },
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    # Restore state from session for security
    flow.state = session.get("state")
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    id_info = id_token.verify_oauth2_token(credentials.id_token, requests.Request(), GOOGLE_CLIENT_ID)

    user = User(id_info["sub"], id_info["email"], id_info["name"])
    login_user(user)
    # Store user info as dict, not object
    session["user"] = {"id": user.id, "email": user.email, "name": user.name}
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
@login_required
def dashboard():
    user = session.get("user")
    name = user["name"] if user else "User"
    return render_template("dashboard.html", name=name)

@app.route("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("home"))

@app.route("/otp-login", methods=["GET", "POST"])
def otp_login():
    if request.method == "POST":
        email = request.form.get("email")
        if not email:
            flash("Please provide an email address", "error")
            return render_template("otp_login.html")
        
        # Generate OTP
        otp = generate_otp()
        expiry = datetime.now() + timedelta(minutes=5)
        
        # Store OTP with expiry
        otp_storage[email] = {
            'otp': otp,
            'expiry': expiry,
            'verified': False
        }
        
        # Send OTP email
        if send_otp_email(email, otp):
            session['otp_email'] = email
            flash("OTP sent to your email!", "success")
            return redirect(url_for("verify_otp"))
        else:
            flash("Failed to send OTP. Please check your email configuration.", "error")
            return render_template("otp_login.html")
    
    return render_template("otp_login.html")

@app.route("/verify-otp", methods=["GET", "POST"])
def verify_otp():
    email = session.get('otp_email')
    if not email:
        flash("Please request an OTP first", "error")
        return redirect(url_for("otp_login"))
    
    if request.method == "POST":
        entered_otp = request.form.get("otp")
        
        if email not in otp_storage:
            flash("OTP expired or not found. Please request a new one.", "error")
            return redirect(url_for("otp_login"))
        
        stored_data = otp_storage[email]
        
        # Check if OTP is expired
        if datetime.now() > stored_data['expiry']:
            del otp_storage[email]
            flash("OTP expired. Please request a new one.", "error")
            return redirect(url_for("otp_login"))
        
        # Verify OTP
        if entered_otp == stored_data['otp']:
            # OTP is correct, log in the user
            user = User(email, email, email.split('@')[0])
            login_user(user)
            session["user"] = {"id": user.id, "email": user.email, "name": user.name}
            
            # Clean up OTP
            del otp_storage[email]
            session.pop('otp_email', None)
            
            flash("Login successful!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid OTP. Please try again.", "error")
            return render_template("verify_otp.html", email=email)
    
    return render_template("verify_otp.html", email=email)

if __name__ == "__main__":
    app.run(debug=True)