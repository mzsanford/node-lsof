var cp = require('child_process');

var raw = exports.raw = function(pid, fn) {
    if (typeof pid === 'function') {
        fn = pid;
        pid = parseInt(process.pid);
    }

    cp.exec('lsof -p ' + pid, function(err, d) {
        d = d.split('\n');
        var data = [];
        var headers = d[0].toLowerCase().split(/\s+/);
        headers.forEach(function(v, k) {
            if (v === '') {
                delete headers[k];
            }
        });
        delete d[0]; //Remove the headers
        d.pop(); //Remove the last dead space
        d.forEach(function(v) {
            v = v.split(/\s+/);
            if (v[4] === 'KQUEUE') {
                return;
            }
            var k = {};
            v.forEach(function(s, i) {
                k[headers[i]] = s;
            });
            data.push(k);
        });
        fn(data);
    });
};

var counters = exports.counters = function(pid, fn) {
    if (typeof pid === 'function') {
        fn = pid;
        pid = parseInt(process.pid);
    }
    raw(pid, function(data) {
        var t = {};
        data.forEach(function(v) {
            var ty = v.type.toLowerCase();
            if (!t[ty]) {
                t[ty] = 0;
            }
            t[ty]++;
        });
        var d = {
            pid: pid,
            user: data[0].user,
            open: data.length,
            types: t
        };
        fn(d);
    });
    
}

function trim(string) {
    return string.replace(/^\s*|\s*$/, '');
}
