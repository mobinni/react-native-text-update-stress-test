package com.label

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.LabelViewManagerInterface
import com.facebook.react.viewmanagers.LabelViewManagerDelegate

@ReactModule(name = LabelViewManager.NAME)
class LabelViewManager : SimpleViewManager<LabelView>(),
  LabelViewManagerInterface<LabelView> {
  private val mDelegate: ViewManagerDelegate<LabelView>

  init {
    mDelegate = LabelViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<LabelView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LabelView {
    return LabelView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: LabelView?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "LabelView"
  }
}
