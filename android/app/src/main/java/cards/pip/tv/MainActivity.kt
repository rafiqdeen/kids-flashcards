package cards.pip.tv

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.KeyEvent
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

/**
 * Full-screen WebView host for the Pip Cards PWA on Android TV.
 *
 * The web app does everything; this activity only:
 *  - loads the hosted PWA with ?tv=1 (and injects window.__PIP_TV__ as a backup),
 *  - keeps the screen awake,
 *  - forwards the remote BACK button to the page's back bridge (window.__pipBack),
 *  - leaves D-pad arrows / OK to Chromium WebView (the page's global navigator handles them).
 */
class MainActivity : ComponentActivity() {

    private lateinit var web: WebView

    // ▸ Set this to your deployment. The PWA's service worker precaches all assets, so after
    //   the first online launch the app runs fully offline and updates OTA (no new APK).
    private val startUrl = "https://YOUR-DEPLOYMENT.vercel.app/?tv=1"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        web = WebView(this).apply {
            layoutParams = android.view.ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT)
            keepScreenOn = true // narration / idle screens must not dim
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                mediaPlaybackRequiresUserGesture = false // narration audio may autoplay
                cacheMode = WebSettings.LOAD_DEFAULT
            }
            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    // Backup to the ?tv=1 param: ensure the TV flag is set as scripts run.
                    view?.evaluateJavascript("window.__PIP_TV__ = true;", null)
                }
                // Keep all navigation inside the WebView.
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean = false
            }
        }
        setContentView(web)
        if (savedInstanceState == null) web.loadUrl(startUrl) else web.restoreState(savedInstanceState)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            // Ask the page whether it has a layer (modal / sub-screen) to pop.
            web.evaluateJavascript("(window.__pipBack && window.__pipBack.canGoBack()) === true") { result ->
                if (result == "true") {
                    web.evaluateJavascript("window.__pipBack.back();", null) // pop one layer
                } else {
                    finish() // at the World root → exit to the launcher (no confirm dialog)
                }
            }
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }
}
