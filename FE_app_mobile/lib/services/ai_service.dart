import 'dart:async'; 
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';

class AiService {
  static const bool useRealApi = true;

  static const String apiUrl =
      "https://doan-environment-iu49.onrender.com/classify";
  static const String apiKey = "NCKH_PHANMEM";

  static final Dio _dio = Dio();

  static Future<Map<String, dynamic>?> scanWaste(XFile imageFile) async {
    if (useRealApi) {
      return await _callRealApi(imageFile);
    } else {
      return await _callMockApi();
    }
  }

  static Future<Map<String, dynamic>?> _callRealApi(XFile imageFile) async {
    try {
      print("Đang đọc dữ liệu thô (bytes) từ ảnh...");

      // 1. XAY NHUYỄN ẢNH THÀNH BYTES
      final List<int> imageBytes = await imageFile.readAsBytes();

      // 2. TẠO FILE MỚI HOÀN TOÀN TỪ BYTES
      FormData formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          imageBytes,
          filename: 'perfect_image.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      });

      print("Đang gửi lên Server AI: $apiUrl ...");

      // 3. THỰC HIỆN GỌI API (NÂNG CẤP BỘ ĐẾM THỜI GIAN TIMEOUT 30 GIÂY)
      Response response = await _dio
          .post(
            apiUrl,
            data: formData,
            options: Options(
              headers: {'X-API-Key': apiKey},
              validateStatus: (status) => true,
            ),
          )
          .timeout(
            const Duration(seconds: 30),
            onTimeout: () {
              // Nếu quá 30 giây, lập tức ném lỗi để không bị xoay loading vô hạn
              throw TimeoutException(
                "Server AI đang khởi động. Vui lòng thử lại!",
              );
            },
          );

      // 4. XỬ LÝ KẾT QUẢ TRẢ VỀ
      print("Server phản hồi: Code ${response.statusCode}");

      if (response.statusCode == 200) {
        final decodedData = response.data;

        if (decodedData['success'] == true) {
          var aiData = decodedData['data'];

          // Tự động tính điểm
          int calculatedPoints = 2;
          if (aiData['is_recyclable'] == true) {
            calculatedPoints = 15;
          } else if (aiData['is_organic'] == true) {
            calculatedPoints = 5;
          }

          print("AI Nhận diện thành công: ${aiData['item_name']}");

          return {
            "itemName": aiData['item_name'] ?? "Không nhận diện được",
            "category": aiData['label'] ?? "Chưa rõ",
            "confidence": 0.98,
            "suggestion":
                aiData['disposal_advice'] ?? "Hãy bỏ rác đúng nơi quy định.",
            "points": calculatedPoints,
          };
        } else {
          print("AI từ chối: ${decodedData['message']}");
          return null;
        }
      } else {
        print("Lỗi Server: ${response.statusCode} - ${response.data}");
        return null;
      }
    } on TimeoutException catch (e) {
      // Bắt riêng lỗi Timeout để báo cho bên ngoài biết
      print(" Lỗi thời gian chờ: ${e.message}");
      throw Exception("TIMEOUT"); 
    } catch (e) {
      print("Lỗi kết nối AI Service: $e");
      return null;
    }
  }

  // --- MOCK DATA ---
  static Future<Map<String, dynamic>> _callMockApi() async {
    await Future.delayed(const Duration(seconds: 3));
    return {
      "itemName": "Chai nhựa PET",
      "category": "Rác tái chế",
      "confidence": 0.98,
      "suggestion":
          "Hãy đổ hết nước, súc sạch và làm bẹp chai trước khi bỏ vào thùng rác màu cam nhé!",
      "points": 15,
    };
  }
}
