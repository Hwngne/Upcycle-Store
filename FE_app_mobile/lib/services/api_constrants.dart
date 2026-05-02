class ApiConstants {
  // 1. Link Backend Node.js 
  static const String backendDomain = "doan-environment-8ekr.onrender.com";
  
  // 2. Link Backend AI Python 
  static const String aiDomain = "doan-environment-iu49.onrender.com"; 
  static const String baseUrl = "https://$backendDomain/api/mobile";
  static const String serverUrl = "https://$backendDomain";
  // Đường dẫn gốc cho con AI (Python)
  static const String aiBaseUrl = "https://$aiDomain";
}