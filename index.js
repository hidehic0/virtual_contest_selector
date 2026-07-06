const SKIP_CONTESTS = new Set([316]);

document.addEventListener("DOMContentLoaded", () => {
  const ignore_contests = document.getElementById("ignore_contests"),
    response_div = document.getElementById("response"),
    contest_lower_dom = document.getElementById("contest_lower"),
    contest_upper_dom = document.getElementById("contest_upper"),
    generate_button = document.getElementById("generate_button");

  function get_ignore_contests() {
    return new Set(
      (ignore_contests.value.match(/ABC\d\d\d/g) ?? []).map((x) => Number(x.slice(3))),
    );
  }

  function add_ignore_contest(contest_id) {
    ignore_contests.value += `${ignore_contests.value ? "\n" : ""}ABC${String(contest_id).padStart(3, "0")}`;
    localStorage.setItem("ignore_contests", ignore_contests.value);
  }

  function rand_range(l, u) {
    return Math.floor(Math.random() * (u - l) + l);
  }

  function error_html(message) {
    return `<p class="error_message">${message}</p>`;
  }

  function get_available_contests() {
    const contest_lower = Number(contest_lower_dom.value),
      contest_upper = Number(contest_upper_dom.value);
    const ignore_contests = get_ignore_contests();

    let res = [];

    for (let i = contest_lower; i <= contest_upper; i++) {
      if (!SKIP_CONTESTS.has(i) && !ignore_contests.has(i)) res.push(i);
    }

    return res;
  }

  function validateInput() {
    const contest_lower_value = contest_lower_dom.value,
      contest_upper_value = contest_upper_dom.value;

    if (!contest_lower_value || !contest_upper_value) {
      response_div.innerHTML = error_html("使うコンテストの下限と上限を設定してください。");
      return true;
    }

    const contest_lower = Number(contest_lower_value),
      contest_upper = Number(contest_upper_value);

    if (contest_lower > contest_upper) {
      response_div.innerHTML = error_html("使うコンテストの下限を上限より小さくしてください。");
      return true;
    }

    if (contest_lower <= 0) {
      response_div.innerHTML = error_html("使うコンテストの下限は1以上でないといけません。");
      return true;
    }

    let available_contests = get_available_contests();

    if (available_contests.length == 0) {
      response_div.innerHTML = error_html("抽出可能なコンテストがありません。");
      return true;
    }
    response_div.innerHTML = "";
    return false;
  }

  const fields = { contest_lower: 212, contest_upper: 450, ignore_contests: "" };

  for (let field in fields) {
    const el = document.getElementById(field);

    if (!el) continue;

    const saved = localStorage.getItem(field);

    if (saved !== null) {
      el.value = saved;
    } else {
      el.value = fields[field];
    }

    el.addEventListener("input", () => {
      localStorage.setItem(field, el.value);

      if (validateInput()) {
        generate_button.setAttribute("disabled", true);
      } else {
        generate_button.removeAttribute("disabled");
      }
    });
  }

  if (validateInput()) {
    generate_button.setAttribute("disabled", true);
  }

  if (generate_button) {
    generate_button.addEventListener("click", () => {
      let available_contests = get_available_contests();

      if (available_contests.length == 0) {
        response_div.innerHTML = error_html("抽出可能なコンテストがありません。");
        return;
      }

      const contest_id = available_contests[rand_range(0, available_contests.length)];

      response_div.innerHTML = `<div class="response-row"><a href="https://atcoder.jp/contests/abc${String(contest_id).padStart(3, "0")}" target="_blank" rel="noreferrer"><span>ABC${String(contest_id).padStart(3, "0")}</span></a><button id="add_ignore_list_button">除外リストに追加</button></div>`;
      response_div
        .querySelector("#add_ignore_list_button")
        .addEventListener("click", () => add_ignore_contest(contest_id));
    });
  }
});
