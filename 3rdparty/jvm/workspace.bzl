load("@rules_jvm_external//:defs.bzl", "maven_install")

# To update the pinned dependencies, use:
# $ ./bazel run @unpinned_thirdparty_jvm//:pin

# TODO(Dave): Would really like a much nicer way of specifying these, which would have the nicer
# effect of also giving me aesthetic aliases for complete bundles in a local BUILD file.  Would
# also really like a way to do automatic version updates / consistent version resolutions across
# the repository
def artifacts():
    return [
        ##############################################
        # Simple logging
        #---------------------------------------------
        "org.slf4j:slf4j-api:1.7.5",
        "org.slf4j:slf4j-simple:1.7.5",
        ##############################################

        ##############################################
        # Enumeratum, of course
        #---------------------------------------------
        "com.beachape:enumeratum_2.12:1.6.1",
        # ... and supporting libraries
        "com.beachape:enumeratum-circe_2.12:1.6.1",
        ##############################################

        ##############################################
        # Kantan, for CSV
        #---------------------------------------------
        "com.nrinaudo:kantan.csv_2.12:0.6.1",
        "com.nrinaudo:kantan.csv-cats_2.12:0.6.1",
        "com.nrinaudo:kantan.csv-enumeratum_2.12:0.6.1",
        "com.nrinaudo:kantan.csv-generic_2.12:0.6.1",
        # (if performance becomes an issue)
        #"com.nrinaudo:kantan.csv-jackson_2.12:0.6.1",
        ##############################################

        ##############################################
        # Tapir, for HTTP serving
        #---------------------------------------------
        "com.softwaremill.sttp.tapir:tapir-core_2.12:0.16.1",
        ##############################################

        ##############################################
        # ZIO
        #---------------------------------------------
        "dev.zio:zio_2.12:1.0.0",
        "dev.zio:zio-interop-cats_2.12:2.1.4.0",
        ##############################################

        ##############################################
        # UZHttp, for simple HTTP serving
        #---------------------------------------------
        "org.polynote:uzhttp_2.12:0.2.5",
        ##############################################

        ##############################################
        # http4s for HTTP serving, of course
        #---------------------------------------------
        "org.http4s:http4s-dsl_2.12:0.21.6",
        # ...and supporting libraries
        "org.http4s:http4s-blaze-client_2.12:0.21.6",
        "org.http4s:http4s-blaze-server_2.12:0.21.6",
        "org.http4s:http4s-circe_2.12:0.21.6",
        ##############################################

        ##############################################
        # Circe, for JSON handling
        #---------------------------------------------
        "io.circe:circe-generic_2.12:0.13.0",
        ##############################################

        ##############################################
        # Cats, of course.  We love FP.
        #---------------------------------------------
        "org.typelevel:cats-core_2.12:2.2.0",
        "org.typelevel:cats-effect_2.12:2.2.0",
        ##############################################
    ]

def test_artifacts():
    return [
        ##############################################
        # Scalacheck
        #---------------------------------------------
        "org.scalacheck:scalacheck_2.12:1.13.4",
        ##############################################

        ##############################################
        # Scalatest
        #---------------------------------------------
        "org.scalatest:scalatest_2.12:3.0.4",
        ##############################################

        ##############################################
        # ZIO test
        #---------------------------------------------
        "dev.zio:zio-test_2.12:1.0.0",
        ##############################################
    ]

def thirdparty_jvm_dependencies():
    maven_install(
        name = "thirdparty_jvm",
        # TODO(Dave): Make test_artifacts be marked testonly
        artifacts = artifacts() + test_artifacts(),
        repositories = [
            "https://repo.maven.apache.org/maven2",
            "https://maven-central.storage-download.googleapis.com/maven2",
            "https://mirror.bazel.build/repo1.maven.org/maven2",
        ],
        fetch_sources = True,
        maven_install_json = "@//3rdparty/jvm:pinned_thirdparty_jvm_install.json",
    )