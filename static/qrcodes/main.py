import qrcode

def gerar_qr_code(produto_id):
    # Defina o conteúdo do QR Code (por exemplo, o ID do produto)
    data = produto_id

    # Crie o QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)

    # Crie a imagem do QR Code
    img = qr.make_image(fill='black', back_color='white')

    # Salve a imagem com o nome do produto_id
    img.save(f'{produto_id}.png')

gerar_qr_code("10408e6e-263f-4986-86e5-f5caa6a57340")
