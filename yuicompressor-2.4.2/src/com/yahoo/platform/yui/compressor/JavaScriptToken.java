/*
 * YUI Compressor
 * Author: Julien Lecomte <jlecomte@yahoo-inc.com>
 * Copyright (c) 2007, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 *     http://developer.yahoo.net/yui/license.txt
 */

package com.yahoo.platform.yui.compressor;

public class JavaScriptToken {

    private int type;
    private String value;

    JavaScriptToken(int type, String value) {
        this.type = type;
        this.value = value;
    }

    int getType() {
        return type;
    }

    String getValue() {
        return value;
    }
}
