import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'api_constrants.dart'; // Lưu ý tên file import của bạn

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? socket;

  String? currentChatRoomId;

  void initSocket(String myId) {
    if (socket != null && socket!.connected) return;

    socket = IO.io(ApiConstants.baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket!.connect();

    socket!.onConnect((_) {
      print("🟢 SocketService đã kết nối !");
      socket!.emit('user_online', myId);
    });

    socket!.onDisconnect((_) {
      print("🔴 SocketService đã ngắt kết nối!");
    });
  }

  void disconnect() {
    socket?.disconnect();
    socket?.dispose();
    socket = null;
  }
}
