package com.jdhub.emmaus;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/**
 * EMMAUS — The Unfolding. A thin, fully offline shell around the game.
 *
 * The whole game is one self-contained HTML file in assets/. Nothing is fetched
 * and no INTERNET permission is requested, so it works with no connection at
 * all. Links out (call, WhatsApp, Telegram, mail) are handed to the system.
 */
public class MainActivity extends Activity {

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0B0E1A"));
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0B0E1A"));
        web.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        web.setLongClickable(false);
        web.setHapticFeedbackEnabled(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setTextZoom(100);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.setSafeBrowsingEnabled(false);
        }

        // Keep every navigation inside the app, except links meant for other apps.
        web.setWebViewClient(new GameClient(this));

        root.addView(web);
        setContentView(root);
        web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public boolean onKeyDown(int code, KeyEvent e) {
        if (code == KeyEvent.KEYCODE_BACK && web != null && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(code, e);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            ((ViewGroup) web.getParent()).removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    /**
     * Sends anything that is not the game itself out to the system, so a phone
     * number opens the dialler and a WhatsApp link opens WhatsApp. Declared as a
     * named nested class rather than an anonymous one: d8 in build-tools 34.0.0
     * crashes on anonymous inner classes produced by recent javac.
     */
    private static final class GameClient extends WebViewClient {

        private final Activity host;

        GameClient(Activity host) { this.host = host; }

        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            return handle(r.getUrl().toString());
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView v, String url) {
            return handle(url);
        }

        private boolean handle(String url) {
            if (url == null) return false;
            if (url.startsWith("file://")) return false;             // the game itself
            if (url.startsWith("tel:") || url.startsWith("mailto:")
                    || url.startsWith("sms:") || url.startsWith("whatsapp:")
                    || url.startsWith("tg:") || url.startsWith("https://wa.me/")
                    || url.startsWith("https://t.me/") || url.startsWith("http")) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    host.startActivity(i);
                } catch (Exception ignored) { /* no app for this link */ }
                return true;
            }
            return false;
        }
    }
}
