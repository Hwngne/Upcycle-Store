import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'pages/auth/splash_page.dart';
import 'package:bot_toast/bot_toast.dart';

void main() {
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const UpcycleStoreApp());
}

class UpcycleStoreApp extends StatelessWidget {
  const UpcycleStoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      builder: BotToastInit(),
      navigatorObservers: [BotToastNavigatorObserver()],
      debugShowCheckedModeBanner: false,
      title: 'UpcycleStore',
      theme: ThemeData(
        // Cập nhật màu chủ đạo thành màu Đỏ
        primaryColor: const Color(0xFFB71C1C),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFB71C1C)),
        fontFamily: 'Roboto',
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
      ),
      home: const SplashPage(),
    );
  }
}
