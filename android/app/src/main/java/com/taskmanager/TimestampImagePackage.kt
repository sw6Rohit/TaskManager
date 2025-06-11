package com.taskmanager

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class TimestampImagePackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(TimestampImageModule(reactContext))
    }
}
