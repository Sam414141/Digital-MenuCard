#!/usr/bin/env python3
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import datetime
import os
import socket

# Get the local IP address
def get_local_ip():
    try:
        # Connect to a remote server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# Generate private key
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=default_backend()
)

# Get local IP for SAN
local_ip = get_local_ip()

# Generate certificate
subject = issuer = x509.Name([
    x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
    x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"CA"),
    x509.NameAttribute(NameOID.LOCALITY_NAME, u"Local Network"),
    x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"Digital Menu Card"),
    x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
])

cert = x509.CertificateBuilder().subject_name(
    subject
).issuer_name(
    issuer
).public_key(
    private_key.public_key()
).serial_number(
    x509.random_serial_number()
).not_valid_before(
    datetime.datetime.utcnow()
).not_valid_after(
    datetime.datetime.utcnow() + datetime.timedelta(days=365)
).add_extension(
    x509.SubjectAlternativeName([
        x509.DNSName(u"localhost"),
        x509.DNSName(u"127.0.0.1"),
        x509.IPAddress(__import__('ipaddress').ip_address(local_ip)),
    ]),
    critical=False,
).sign(private_key, hashes.SHA256(), default_backend())

# Write certificate to file
cert_path = os.path.join(os.path.dirname(__file__), "certificates", "cert.pem")
with open(cert_path, "wb") as f:
    f.write(cert.public_bytes(serialization.Encoding.PEM))

# Write private key to file
key_path = os.path.join(os.path.dirname(__file__), "certificates", "key.pem")
with open(key_path, "wb") as f:
    f.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ))

print("✅ Self-signed certificates generated successfully!")
print(f"   Local IP: {local_ip}")
print(f"   Certificate: {cert_path}")
print(f"   Private Key: {key_path}")
print("\n📝 Next steps:")
print("1. Restart the backend server")
print("2. Access the application via HTTPS:")
print(f"   - Local: https://localhost:3001")
print(f"   - Network: https://{local_ip}:3001")
print("\n⚠️  Browser Warning:")
print("   You will see a security warning about the self-signed certificate.")
print("   This is normal. Click 'Advanced' and 'Proceed to ...' to continue.")