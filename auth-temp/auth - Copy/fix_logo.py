import re

# Read the current file
with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the send_otp_email function
# Define the new function
new_function = '''def get_logo_base64():
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
        # Load and encode the logo
        logo_base64 = get_logo_base64()
        
        # If logo exists, use it; otherwise use text
        if logo_base64:
            logo_html = f'<img src="{logo_base64}" alt="STOCKMASTER Logo" style="max-width: 400px; height: auto;">'
        else:
            logo_html = '<h1 style="color: #0066cc;">STOCKMASTER</h1>'
        
        html_body = f\'\'\'
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        {logo_html}
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
        \'\'\'
'''

# Pattern to find the old send_otp_email function  
pattern = r'def send_otp_email\(email, otp\):.*?html_body = f\'\'\'.*?\'\'\''

# Replace
content = re.sub(pattern, new_function, content, flags=re.DOTALL)

# Write back
with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed! Logo loading function added and send_otp_email updated.")
