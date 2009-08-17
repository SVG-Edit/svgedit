/*
 * YUI Compressor
 * Author: Julien Lecomte <jlecomte@yahoo-inc.com>
 * Copyright (c) 2007, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 *     http://developer.yahoo.net/yui/license.txt
 */

package com.yahoo.platform.yui.compressor;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class JarClassLoader extends ClassLoader {

    private static String jarPath;

    public Class loadClass(String name) throws ClassNotFoundException {

        // First check if the class is already loaded
        Class c = findLoadedClass(name);
        if (c == null) {
            c = findClass(name);
        }

        if (c == null) {
            c = ClassLoader.getSystemClassLoader().loadClass(name);
        }

        return c;
    }

    private static String getJarPath() {

        if (jarPath != null) {
            return jarPath;
        }

        String classname = JarClassLoader.class.getName().replace('.', '/') + ".class";
        String classpath = System.getProperty("java.class.path");
        String classpaths[] = classpath.split(System.getProperty("path.separator"));

        for (int i = 0; i < classpaths.length; i++) {

            String path = classpaths[i];
            JarFile jarFile = null;
            JarEntry jarEntry = null;

            try {
                jarFile = new JarFile(path);
                jarEntry = findJarEntry(jarFile, classname);
            } catch (IOException ioe) {
                /* ignore */
            } finally {
                if (jarFile != null) {
                    try {
                        jarFile.close();
                    } catch (IOException ioe) {
                        /* ignore */
                    }
                }
            }

            if (jarEntry != null) {
                jarPath = path;
                break;
            }
        }

        return jarPath;
    }

    private static JarEntry findJarEntry(JarFile jarFile, String entryName) {

        Enumeration entries = jarFile.entries();

        while (entries.hasMoreElements()) {
            JarEntry entry = (JarEntry) entries.nextElement();
            if (entry.getName().equals(entryName)) {
                return entry;
            }
        }

        return null;
    }

    protected Class findClass(String name) {

        Class c = null;
        String jarPath = getJarPath();

        if (jarPath != null) {
            JarFile jarFile = null;
            try {
                jarFile = new JarFile(jarPath);
                c = loadClassData(jarFile, name);
            } catch (IOException ioe) {
                /* ignore */
            } finally {
                if (jarFile != null) {
                    try {
                        jarFile.close();
                    } catch (IOException ioe) {
                        /* ignore */
                    }
                }
            }
        }

        return c;
    }

    private Class loadClassData(JarFile jarFile, String className) {

        String entryName = className.replace('.', '/') + ".class";
        JarEntry jarEntry = findJarEntry(jarFile, entryName);
        if (jarEntry == null) {
            return null;
        }

        // Create the necessary package if needed...
        int index = className.lastIndexOf('.');
        if (index >= 0) {
            String packageName = className.substring(0, index);
            if (getPackage(packageName) == null) {
                definePackage(packageName, "", "", "", "", "", "", null);
            }
        }

        // Read the Jar File entry and define the class...
        Class c = null;
        try {
            InputStream is = jarFile.getInputStream(jarEntry);
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            copy(is, os);
            byte[] bytes = os.toByteArray();
            c = defineClass(className, bytes, 0, bytes.length);
        } catch (IOException ioe) {
            /* ignore */
        }

        return c;
    }

    private void copy(InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[1024];
        while (true) {
            int len = in.read(buf);
            if (len < 0) break;
            out.write(buf, 0, len);
        }
    }
}