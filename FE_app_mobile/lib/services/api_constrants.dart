class ApiConstants {
  static const String serverIp = "192.168.2.14";
  static const String port = "5000";

  // Đường dẫn gốc dùng chung cho toàn bộ App
  static const String baseUrl = "http://$serverIp:$port/api/mobile";
  // Dùng cho gọi hình ảnh (Chỉ đến thư mục gốc của server)
  static const String serverUrl = "http://$serverIp:$port";
}
