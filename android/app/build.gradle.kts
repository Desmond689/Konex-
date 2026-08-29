plugins {
    id("com.android.application")
    id("dev.flutter.flutter-gradle-plugin")
}

if (file("google-services.json").exists()) {
    apply(plugin = "com.google.gms.google-services")
}

android {
    namespace = "com.example.konex"

    compileSdk = 36
    ndkVersion = flutter.ndkVersion

    defaultConfig {
        applicationId = "com.example.konex"

        minSdk = maxOf(24, flutter.minSdkVersion)
        targetSdk = 36

        versionCode = flutter.versionCode
        versionName = flutter.versionName

        // Only build native libs for real-device architectures.
        // x86/x86_64 are emulator-only and roughly double the memory/time
        // spent in mergeReleaseNativeLibs + stripReleaseDebugSymbols, which
        // is native tooling outside the JVM heap — this is what was
        // silently OOM-killing the CI runner, not the Gradle/Kotlin heap.
        ndk {
            abiFilters += setOf("armeabi-v7a", "arm64-v8a")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(
            org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
        )
    }
}

flutter {
    source = "../.."
}