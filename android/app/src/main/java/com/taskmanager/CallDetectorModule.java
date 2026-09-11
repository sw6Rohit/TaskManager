package com.taskmanager;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class CallDetectorModule extends ReactContextBaseJavaModule {
    static final String EVENT_NAME = "CallDisconnected";
    static final String PREFS_NAME = "call_feedback";
    static final String PENDING_CALL_KEY = "pending_call";

    private static ReactApplicationContext reactContext;

    CallDetectorModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "CallDetector";
    }

    static void publishDisconnectedCall(Context context, String callJson) {
        preferences(context).edit().putString(PENDING_CALL_KEY, callJson).apply();

        ReactApplicationContext currentContext = reactContext;
        if (currentContext != null && currentContext.hasActiveReactInstance()) {
            currentContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(EVENT_NAME, callJson);
        }
    }

    @ReactMethod
    public void getPendingCall(Promise promise) {
        promise.resolve(preferences(getReactApplicationContext())
            .getString(PENDING_CALL_KEY, null));
    }

    @ReactMethod
    public void clearPendingCall(Promise promise) {
        preferences(getReactApplicationContext()).edit().remove(PENDING_CALL_KEY).apply();
        promise.resolve(null);
    }

    @ReactMethod
    public void configureCallSync(String userId, double legacyTimestamp, Promise promise) {
        try {
            NativeCallSync.configure(getReactApplicationContext(), userId, legacyTimestamp);
            promise.resolve(null);
        } catch (Exception error) {
            promise.reject("CALL_SYNC_CONFIG", error);
        }
    }

    @ReactMethod
    public void syncCallLogs(Promise promise) {
        NativeCallSync.executor.execute(() -> {
            try {
                promise.resolve(NativeCallSync.sync(getReactApplicationContext()));
            } catch (Exception error) {
                CallService.schedule(getReactApplicationContext());
                promise.reject("CALL_SYNC_FAILED", error);
            }
        });
    }

    // Required by NativeEventEmitter.
    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(double count) {
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}
