(function () {
  "use strict";
  var loadT = Date.now();

  // Closed doors: rattle and explain.
  var lines = [
    "Locked. The doors open Summer 2027.",
    "Still locked. The usher says: grab a presale ticket and you'll be first in.",
    "Nice try. Nobody gets in until Summer 2027, not even the popcorn guy."
  ];
  var tries = 0;
  document.querySelectorAll("[data-doors]").forEach(function (d) {
    var msg = document.getElementById(d.getAttribute("aria-describedby"));
    d.addEventListener("click", function () {
      d.classList.remove("rattle");
      void d.offsetWidth;
      d.classList.add("rattle");
      if (msg) msg.textContent = lines[Math.min(tries, lines.length - 1)];
      tries++;
    });
  });

  function dest(el) {
    try {
      return atob(el.getAttribute("data-a")) + String.fromCharCode(64) + atob(el.getAttribute("data-b")) + atob(el.getAttribute("data-c"));
    } catch (e) { return ""; }
  }

  var form = document.getElementById("join");
  if (form) {
    var touched = false;
    var mark = function () { touched = true; };
    form.addEventListener("keydown", mark);
    form.addEventListener("pointerdown", mark);
    var status = form.querySelector(".status");
    var btn = form.querySelector("button[type=submit]");
    var say = function (s, msg) { status.setAttribute("data-s", s); status.textContent = msg; };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector("[name=_honey]").value) { say("bad", "That didn't go through. Please try again."); return; }
      if (!touched || Date.now() - loadT < 3000) { say("warn", "Give it a second, then press the button again."); return; }
      var to = dest(form);
      if (!to) { say("bad", "Sending failed on our end. Please try again later."); return; }
      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        page: location.href,
        _subject: form.elements._subject.value,
        _template: "table",
        _captcha: "false",
        _honey: ""
      };
      btn.disabled = true;
      say("warn", "Sending...");
      fetch("https://formsubmit.co/ajax/" + to, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; });
      }).then(function (res) {
        var okv = res.j && (res.j.success === true || res.j.success === "true");
        if (res.ok && okv) {
          say("ok", "You're in line. We'll email you when the doors open.");
          form.reset();
        } else {
          say("warn", "We couldn't confirm your signup went through. Please try again in a little while.");
        }
      }).catch(function () {
        say("bad", "Sending failed. Check your connection and try again.");
      }).then(function () { btn.disabled = false; });
    });
  }
})();
