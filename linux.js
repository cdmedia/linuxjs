var Jor1k = require("Jor1k");
var LinuxTerm = require("LinuxTerm");

function Fullscreen()
{
    document.body.style.margin = '0px';
    window.onresize = function(event) {
        var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

        var d = x/y;
        if (d > 1.6) x = y*1.6; else y = x/1.6;

        var fb = document.getElementById("fbfullscreen");
        fb.style.width = "" + x + "px";
        fb.style.height = "" + y + "px";
};
    window.onresize();
    jor1k.framebuffer.Init("fbfullscreen");
}


function OnUploadFiles(files)
{
    var path = document.getElementById("loadPath").value;
    for (var i = 0, f; f = files[i]; i++) {
        jor1k.fs.UploadExternalFile(path, f);
    }
}

function RandomString(length) {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// from https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return decodeURIComponent(pair[1]);}
       }
       return(false);
}

function Start() {

    var pushState = false, loadUserData = false;
    var userid = getQueryVariable("user");
    if (userid == false) {
       userid = RandomString(10);
       pushState = true;
    } else {
       loadUserData = true;
    }
    // allow specifying relay URL via querystring
    var relayURL = getQueryVariable("relayURL")
    if (relayURL == false) {
        relayURL = "wss://relay.widgetry.org/";
        pushState = true;
    }

    jor1kparameters = {
        path: "../sys/",
        system: {
            kernelURL: "kernel/vmlinux.bin.bz2", // kernel image
            memorysize: 32, // in MB, must be a power of two
            cpu: "asm", // short name for the cpu to use
            ncores: 1,
        },
        fs: {
            basefsURL: "basefs.json", // json file with the basic filesystem configuration.
            extendedfsURL: "fs.json", // json file with extended filesystem informations. Loaded after the basic filesystem has been loaded.
            earlyload: [], // list of files which should be loaded immediately after they appear in the filesystem
            lazyloadimages: [
            ] // list of automatically loaded images after the basic filesystem has been loaded
	},

        term: new LinuxTerm("tty"), // canvas id for the terminal
        fbid: "fb",                // canvas id for the framebuffer
        clipboardid: "clipboard",  // input id for the clipboard
        statsid: "stats",          // object id for the statistics test
        fps: 10, // update interval of framebuffer
        relayURL: relayURL, // relay url for the network
        userid: userid, // unique user id string. Empty, choosen randomly, from a url, or from a cookie.
        syncURL: "//jor1k.com/sync/upload.php" // url to sync a certain folder
    }

    // --------------------------------------------------------
    if (loadUserData)
        jor1kparameters.fs.lazyloadimages.push("sync/tarballs/"+userid+".tar.bz2");

    var nCores = getQueryVariable("n");
    if (nCores != false) {
       jor1kparameters.system.ncores = nCores;
    } else {
       pushState = true;
    }
    var cpu = getQueryVariable("cpu");
    if (cpu != false) {
       jor1kparameters.system.cpu = cpu;
       if (jor1kparameters.system.cpu == "smp") {
             console.log("Load smp kernel");
             jor1kparameters.system.kernelURL = "kernel/vmlinuxsmp.bin.bz2";
       }
    } else {
       pushState = true;
    }
    if (pushState) {
        window.history.pushState([], "", "?user="+encodeURIComponent(jor1kparameters.userid)+"&cpu="+encodeURIComponent(jor1kparameters.system.cpu)+"&n="+encodeURIComponent(jor1kparameters.system.ncores)+"&relayURL="+encodeURIComponent(relayURL));
    }

    // --------------------------------------------------------

    jor1k = new Jor1k(jor1kparameters);

}



// Framebuffer uses canvas



