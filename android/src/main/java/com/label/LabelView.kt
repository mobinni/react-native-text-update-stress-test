package com.label

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.widget.FrameLayout
import android.widget.TextView

class LabelView : FrameLayout {
    private var textView: TextView

    constructor(context: Context) : super(context) {
        textView = setupTextView()
    }
    
    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        textView = setupTextView()
    }
    
    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(
        context,
        attrs,
        defStyleAttr
    ) {
        textView = setupTextView()
    }

    private fun setupTextView(): TextView {
        val tv = TextView(context).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
        addView(tv)
        return tv
    }

    fun setBackgroundColorFromHex(colorString: String) {
        try {
            val color = Color.parseColor(colorString)
            setBackgroundColor(color)
        } catch (e: IllegalArgumentException) {
            // Handle invalid color string
        }
    }

    fun updateLabel(text: String) {
        post {
            textView.text = text
        }
    }

}
