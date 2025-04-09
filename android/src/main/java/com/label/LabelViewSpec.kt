package com.label

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.LabelViewManagerInterface
import com.facebook.react.viewmanagers.LabelViewManagerDelegate
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.facebook.react.bridge.Dynamic
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = LabelViewSpec.NAME)
class LabelViewSpec : ViewManager<LabelView, LabelViewShadowNode>() {
    override fun createViewInstance(context: ThemedReactContext): LabelView {
        return LabelView(context)
    }

    override fun getName(): String {
        return NAME
    }

    override fun createShadowNodeInstance(): LabelViewShadowNode {
        return LabelViewShadowNode()
    }

    override fun getShadowNodeClass(): Class<LabelViewShadowNode> {
        return LabelViewShadowNode::class.java
    }

    override fun getExportedViewConstants(): Map<String, Any>? {
        return null
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return null
    }

    companion object {
        const val NAME = "LabelView"
    }
}

class LabelViewShadowNode : com.facebook.react.uimanager.LayoutShadowNode() {
    // Add any custom shadow node implementation if needed
} 