package digital.playbeat.admin;

import android.app.Activity;
import android.app.AlertDialog;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String[] PINS={"10011","10012","10013"};
    private static final int[] PHOTOS={R.drawable.qazi,R.drawable.creed,R.drawable.mahbuba};
    private static final String[] PROFILES={"Qazi","Creed","Mahbuba"};
    private static final int NAVY=0xff081022, GOLD=0xfff7c555, WHITE=0xfff6faff;
    private FrameLayout root;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private int failures=0;
    private long lockedUntil=0L;
    private int dp(int n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
    private GradientDrawable background(int color,int radius){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));return d;}
    private TextView label(String value,int size,int color){TextView t=new TextView(this);t.setText(value);t.setTextColor(color);t.setTextSize(size);t.setGravity(Gravity.CENTER);t.setTypeface(null,Typeface.BOLD);return t;}
    @Override public void onCreate(Bundle saved){super.onCreate(saved);getWindow().setStatusBarColor(NAVY);getWindow().setNavigationBarColor(NAVY);selectProfile();}
    private void selectProfile(){
        if(web!=null){web.destroy();web=null;}
        root=new FrameLayout(this);root.setBackgroundColor(NAVY);setContentView(root);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);root.addView(scroll,new FrameLayout.LayoutParams(-1,-1));
        LinearLayout stack=new LinearLayout(this);stack.setOrientation(LinearLayout.VERTICAL);stack.setGravity(Gravity.CENTER_HORIZONTAL);stack.setPadding(dp(25),dp(24),dp(25),dp(24));scroll.addView(stack);
        TextView title=label("✦ PLAYBEAT",29,GOLD);stack.addView(title,new LinearLayout.LayoutParams(-1,dp(76)));
        TextView subtitle=label("SELECT YOUR PROFILE",16,WHITE);stack.addView(subtitle,new LinearLayout.LayoutParams(-1,dp(45)));
        for(int i=0;i<3;i++){
            final int index=i;
            FrameLayout frame=new FrameLayout(this);
            frame.setBackground(background(0xff142a48,24));
            LinearLayout.LayoutParams card=new LinearLayout.LayoutParams(-1,dp(155));card.setMargins(0,dp(14),0,dp(14));stack.addView(frame,card);
            ImageView image=new ImageView(this);image.setImageResource(PHOTOS[i]);image.setScaleType(ImageView.ScaleType.CENTER_CROP);
            image.setBackground(background(0xff182642,22));image.setClipToOutline(true);
            FrameLayout.LayoutParams fp=new FrameLayout.LayoutParams(-1,-1);fp.setMargins(dp(4),dp(4),dp(4),dp(4));frame.addView(image,fp);
            TextView enter=label("◉",25,GOLD);enter.setBackground(background(0xbb080e21,60));
            FrameLayout.LayoutParams ep=new FrameLayout.LayoutParams(dp(48),dp(48),Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL);ep.bottomMargin=dp(6);frame.addView(enter,ep);
            frame.setContentDescription("PIN access for "+PROFILES[i]);frame.setOnClickListener(v->pinEntry(index));
        }
        TextView privacy=label("Private PIN  •  Authenticated admin connection",11,0xff95afcb);
        stack.addView(privacy,new LinearLayout.LayoutParams(-1,dp(46)));
    }
    private void pinEntry(int idx){
        if(SystemClock.elapsedRealtime()<lockedUntil){Toast.makeText(this,"Temporarily locked; retry shortly",Toast.LENGTH_SHORT).show();return;}
        LinearLayout pane=new LinearLayout(this);pane.setOrientation(LinearLayout.VERTICAL);pane.setGravity(Gravity.CENTER);
        pane.setPadding(dp(24),dp(18),dp(24),dp(8));pane.setBackground(background(0xff152741,25));
        FrameLayout ring=new FrameLayout(this);ring.setBackground(background(GOLD,99));
        ImageView portrait=new ImageView(this);portrait.setImageResource(PHOTOS[idx]);portrait.setScaleType(ImageView.ScaleType.CENTER_CROP);
        portrait.setBackground(background(NAVY,100));portrait.setClipToOutline(true);
        FrameLayout.LayoutParams photoParams=new FrameLayout.LayoutParams(dp(110),dp(110),Gravity.CENTER);ring.addView(portrait,photoParams);
        pane.addView(ring,new LinearLayout.LayoutParams(dp(120),dp(120)));
        ObjectAnimator rotation=ObjectAnimator.ofFloat(ring,"rotation",0,360);rotation.setDuration(6000);
        rotation.setRepeatCount(ValueAnimator.INFINITE);rotation.start();
        TextView prompt=label("ENTER 5-DIGIT PIN",16,WHITE);pane.addView(prompt,new LinearLayout.LayoutParams(-1,dp(54)));
        EditText pin=new EditText(this);pin.setSingleLine(true);pin.setTextSize(22);pin.setGravity(Gravity.CENTER);pin.setTextColor(WHITE);
        pin.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_VARIATION_PASSWORD);
        pin.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(5)});
        pin.setHint("● ● ● ● ●");pin.setBackground(background(0xff273c59,14));
        pane.addView(pin,new LinearLayout.LayoutParams(-1,dp(60)));
        AlertDialog dialog=new AlertDialog.Builder(this).setView(pane).setNegativeButton("Cancel",(d,w)->{}).setPositiveButton("Unlock",null).create();
        dialog.setOnDismissListener(d->rotation.cancel());
        dialog.setOnShowListener(d->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{
            if(PINS[idx].contentEquals(pin.getText())){failures=0;dialog.dismiss();showPortal();}
            else{pin.setText("");pin.setError("Incorrect PIN");failures++;
                if(failures>=5){lockedUntil=SystemClock.elapsedRealtime()+60000;dialog.dismiss();Toast.makeText(this,"Locked for 60 seconds",Toast.LENGTH_LONG).show();}
            }
        }));
        dialog.show();
    }
    private void showPortal(){
        root=new FrameLayout(this);root.setBackgroundColor(NAVY);setContentView(root);
        web=new WebView(this);web.setBackgroundColor(NAVY);
        web.getSettings().setJavaScriptEnabled(true);web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);web.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true);CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));
        ProgressBar progress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        root.addView(progress,new FrameLayout.LayoutParams(-1,dp(4),Gravity.TOP));
        web.setWebChromeClient(new WebChromeClient(){
            @Override public void onProgressChanged(WebView view,int p){progress.setProgress(p);progress.setVisibility(p>=100?View.GONE:View.VISIBLE);}
            @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> cb,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=cb;
                try{startActivityForResult(params.createIntent(),42);return true;}catch(Exception e){fileCallback=null;return false;}
            }
        });
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){
                Uri uri=req.getUrl();String scheme=uri.getScheme();
                if("https".equalsIgnoreCase(scheme)){
                    if(Uri.parse(BuildConfig.PORTAL_URL).getHost().equalsIgnoreCase(uri.getHost()))return false;
                    try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){}
                }else if("tel".equalsIgnoreCase(scheme)||"mailto".equalsIgnoreCase(scheme)){
                    try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){}
                }
                return true;
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest req,WebResourceError error){
                if(req.isForMainFrame())runOnUiThread(()->showError());
            }
        });
        web.loadUrl(BuildConfig.PORTAL_URL);
    }
    private void showError(){
        if(web==null)return;
        LinearLayout overlay=new LinearLayout(this);overlay.setOrientation(LinearLayout.VERTICAL);overlay.setGravity(Gravity.CENTER);
        overlay.setPadding(dp(20),0,dp(20),0);overlay.setBackgroundColor(NAVY);
        overlay.addView(label("Connection failed",21,WHITE),new LinearLayout.LayoutParams(-1,dp(65)));
        Button retry=new Button(this);retry.setText("Retry");overlay.addView(retry,new LinearLayout.LayoutParams(-1,dp(64)));
        retry.setOnClickListener(v->{root.removeView(overlay);web.loadUrl(BuildConfig.PORTAL_URL);});
        Button back=new Button(this);back.setText("Choose Profile");overlay.addView(back,new LinearLayout.LayoutParams(-1,dp(64)));
        back.setOnClickListener(v->selectProfile());
        root.addView(overlay,new FrameLayout.LayoutParams(-1,-1));
    }
    @Override protected void onActivityResult(int r,int code,Intent data){
        super.onActivityResult(r,code,data);
        if(r==42&&fileCallback!=null){fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(code,data));fileCallback=null;}
    }
    @Override public void onBackPressed(){
        if(web!=null&&web.canGoBack()){web.goBack();return;}
        if(web!=null){selectProfile();return;}
        super.onBackPressed();
    }
    @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}