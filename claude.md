tôi muốn làm chức năng Ai tư vấn chuyên về kỹ thuật xây dựng, pháp luật về xây dựng, an toàn lao động ,luôn gym một con Chat ở đây D:\Ky 9\do_an_tot_nghiep\full\ocsp-fontend\src\components\features\chat\components\ChatMessengerList.tsx nằm trên cùng,kh cần lưu db cũng dc,
dùng model này nèfrom google import genai

client = genai.Client()

response = client.models.generate_content(
model="gemini-2.5-flash",
contents="How does AI work?"
)
print(response.text)

nhờ rate limit nhé, users đc chat 5 tin 1 ngày
D:\Ky 9\do_an_tot_nghiep\full\rag-api\RAG-API\app\services\gemini_service.py
D:\Ky 9\do_an_tot_nghiep\full\rag-api\RAG-API\app\main.py
tôi dùng ec2 và git nên xong push lên main và tô dùng ec2 pull về r chạy thôi
