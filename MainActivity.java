package com.example.robotworker;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final int CAMERA_PERMISSION_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // सीधे WebView बनाएं
        webView = new WebView(this);
        setContentView(webView);

        // JavaScript चालू करें (जो आपकी वेबसाइट के लिए ज़रूरी है)
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false); // ऑटोमैटिक वीडियो/कैमरा के लिए

        // WebViewClient ताकि लिंक इसी ऐप के अंदर खुले
        webView.setWebViewClient(new WebViewClient());

        // 🚀 सबसे ज़रूरी मैजिक: कैमरा परमिशन कभी नहीं मांगेगा, खुद-ब-खुद Allow कर देगा!
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        // फोन से कैमरा की परमिशन चेक करें
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_CODE);
        } else {
            // अपनी वेबसाइट का एड्रेस यहाँ डालें (चाहे लोकल हो या लाइव सर्वर)
            webView.loadUrl("http://192.168.x.x:3000/robot.html");
        }
    }
}
