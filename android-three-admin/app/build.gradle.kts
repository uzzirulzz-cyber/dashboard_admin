plugins { id("com.android.application") }
android {
    namespace = "digital.playbeat.admin"
    compileSdk = 35
    defaultConfig {
        applicationId = "digital.playbeat.admin"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }
    flavorDimensions += "portal"
    productFlavors {
        create("digital") {
            dimension = "portal"
            applicationId = "digital.playbeat.admin"
            resValue("string", "app_name", "PlayBeat Digital Admin")
            buildConfigField("String", "PORTAL_URL", "\"https://playbeat.digital/admin\"")
        }
        create("arena") {
            dimension = "portal"
            applicationId = "digital.playbeat.arenaadmin"
            resValue("string", "app_name", "PlayBeat Arena Admin")
            buildConfigField("String", "PORTAL_URL", "\"https://playbeatarena.asia/\"")
        }
        create("gatefit") {
            dimension = "portal"
            applicationId = "digital.playbeat.gatefitadmin"
            resValue("string", "app_name", "PlayBeat Gatefit Admin")
            buildConfigField("String", "PORTAL_URL", "\"https://gatefit.playbeat.digital/\"")
        }
    }
    buildFeatures { buildConfig = true }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
