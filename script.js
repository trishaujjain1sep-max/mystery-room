// THE MYSTERY ROOM — Unreliable Reality Edition
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const modal = $("#modal"), modalTitle = $("#modal-title"), modalIcon = $("#modal-icon");
  const modalContent = $("#modal-content"), closeButton = $("#close-modal"), toast = $("#toast");
  const storyText = $("#story-text"), missionText = $("#mission-text");
  const inventoryElement = $("#inventory"), journalElement = $("#journal");

  const initialStory = "You wake in a bedroom that feels familiar, though you cannot remember arriving. The clock reads 11:47 PM. The door is locked. Something in this room has been changed.";
  const state = {
    diaryRead: false, mirrorRead: false, mirrorCompared: false, secretFound: false,
    computerUnlocked: false, computerFilesRead: false, backupCompared: false,
    clockChecked: false, timelineSolved: false, ending: null,
    inventory: [], clues: [], theories: new Set(), returnFocus: null
  };

  const clueText = {
    diary: "DIARY: October 31 is called both “the first night” and the night that repeated. October 30 is described as tomorrow. The entries cannot all be a straightforward chronology.",
    mirror: "MIRROR: TELOIV reverses to VIOLET. The reflection appears to lag behind the room for a fraction of a second.",
    mirrorCrack: "MIRROR DISCREPANCY: The current mirror is intact, but an older computer image shows a crack in its upper-left corner. The room has at least two conflicting states.",
    computer: "ROOM.LOG: The clock freezes at 11:47 PM. DOOR_CODE says “not the year; use the first memory; month first, then day.”",
    backup: "DIARY.BAK: The backup does not match the diary currently on the desk. A sentence about the door was added after the backup was created.",
    testimony: "USER.TXT: “There was only one person in the room.” This is a claim, not verified evidence. No independent record confirms it.",
    clock: "CLOCK: Frozen at 11:47 PM. Behind it, 10 / 31 is scratched into the wood. The date format is month/day, but the diary's reliability remains uncertain.",
    timeline: "TIMELINE DEDUCTION: The diary was amended after the backup; the computer preserves conflicting records; the mirror shows an earlier room state. The room is a reconstruction assembled from incompatible evidence.",
    secret: "UNINDEXED RECORD: “If the room agrees with every memory, one of them has been erased.” This record is absent from the computer's visible file list."
  };

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));

  function setStory(text) { storyText.textContent = text; }
  function setMission(text) { missionText.textContent = text; }

  function renderInventory() {
    inventoryElement.innerHTML = state.inventory.length
      ? state.inventory.map(item => `<span class="inventory-item">${escapeHTML(item)}</span>`).join("")
      : '<p class="empty-inventory">Nothing collected yet...</p>';
  }

  function renderJournal() {
    journalElement.innerHTML = state.clues.length
      ? state.clues.map(clue => `<p class="journal-entry"><strong>${escapeHTML(clue.title)}</strong><br>${escapeHTML(clue.text)}</p>`).join("")
      : '<p class="journal-empty">Your discoveries will appear here.</p>';
  }

  function addItem(item) {
    if (!state.inventory.includes(item)) {
      state.inventory.push(item);
      renderInventory();
    }
  }

  function addClue(key) {
    if (!state.clues.some(clue => clue.key === key)) {
      const titles = {
        diary:"Diary contradiction", mirror:"The reversed word", mirrorCrack:"The cracked reflection",
        computer:"Computer log", backup:"Original diary backup", testimony:"Unverified testimony",
        clock:"The frozen clock", timeline:"Timeline deduction", secret:"Hidden record"
      };
      state.clues.push({ key, title: titles[key] || key, text: clueText[key] });
      renderJournal();
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2800);
  }

  function openModal(title, icon, html, focusSelector) {
    state.returnFocus = document.activeElement;
    modalTitle.textContent = title;
    modalIcon.textContent = icon;
    modalContent.innerHTML = html;
    modal.classList.remove("hidden");
    setTimeout(() => focusSelector ? modalContent.querySelector(focusSelector)?.focus() : closeButton.focus(), 0);
  }

  function closeModal() {
    modal.classList.add("hidden");
    modalContent.innerHTML = "";
    state.returnFocus?.focus?.();
  }

  const action = (label, name) => `<button type="button" class="game-button" data-action="${name}">${label}</button>`;

  function inspectDiary() {
    if (!state.diaryRead) {
      state.diaryRead = true;
      addItem("Torn diary page");
      addClue("diary");
      setStory("The diary is in your handwriting, but some sentences are not. The dates seem to describe events in the wrong order.");
      setMission("Compare the diary with the mirror. Do not assume a date proves a memory.");
      openModal("Two beginnings", "📔", `
        <p class="modal-copy">The paper smells faintly of dust and strawberry perfume. The final page has been pressed so hard the words are almost torn through.</p>
        <div class="clue-paper"><p><strong>OCTOBER 31</strong> — The first night. I remember everything.</p>
        <p><strong>OCTOBER 30</strong> — Tomorrow, I'll write this again.</p>
        <p><strong>OCTOBER 31</strong> — If I forget my own name, trust the mirror.</p>
        <p style="margin-bottom:0"><strong>1997 is not the answer.</strong></p></div>
        <p class="modal-copy">These entries may not describe one continuous sequence of events.</p>
        ${action("Inspect the mirror", "close-and-mirror")}`);
    } else {
      openModal("The diary", "📔", `<div class="clue-paper"><p>OCTOBER 31 — The first night.</p><p>OCTOBER 30 — Tomorrow, I'll write this again.</p><p>“Trust the mirror.”</p><p>“1997 is not the answer.”</p></div><p class="modal-copy">The contradiction remains. A repeated date does not automatically mean a repeated event.</p>`);
    }
  }

  function inspectMirror() {
    if (!state.mirrorRead) {
      state.mirrorRead = true;
      addItem("Backwards word");
      addClue("mirror");
      setStory("The mirror shows TELOIV. For a fraction of a second, your reflection looks toward the door while you are still facing the glass.");
      setMission("Reverse the word to unlock the computer. Return to the mirror after reading the computer files.");
      openModal("Something in the reflection", "🪞", `
        <p class="modal-copy">A word appears backward across the glass. Your reflection moves a beat too late.</p>
        <div class="clue-paper" style="font-size:30px;letter-spacing:5px">TELOIV</div>
        <form id="mirror-form">
          <label for="mirror-answer">Read the word from right to left.</label>
          <input id="mirror-answer" class="game-input" name="answer" autocomplete="off" placeholder="Enter the word..." required>
          <button class="game-button" type="submit">Check the reflection</button>
          <p class="error-message" id="mirror-error" aria-live="polite"></p>
        </form>`, "#mirror-answer");
      return;
    }
    if (!state.computerFilesRead) {
      openModal("The mirror remembers", "🪞", `<p class="modal-copy">TELOIV still reverses to <strong>VIOLET</strong>. The glass looks normal, but you remember the reflection lagging behind you.</p><p class="modal-copy">The mirror may have another clue after the computer records are examined.</p>`);
      return;
    }
    if (!state.mirrorCompared) {
      state.mirrorCompared = true;
      addClue("mirrorCrack");
      addItem("A discrepancy in the reflection");
      setStory("An old room image on the computer showed a crack in the mirror. The mirror in front of you is intact. Both cannot be faithful records of the same moment.");
      setMission("Compare the original diary backup with the current diary, then reconstruct the timeline.");
      openModal("The mirror is out of time", "🪞", `
        <p class="modal-copy">Now that you have seen the computer's room image, you notice a thin crack in the upper-left corner of the mirror in the image. Your mirror has no crack.</p>
        <div class="clue-paper">SAME ROOM. DIFFERENT STATE.</div>
        <p class="modal-copy">The reflection is not proof of what happened. It is proof that the room's records disagree.</p>
        ${action("Step away from the mirror", "close-modal")}`);
      return;
    }
    if (state.secretFound) {
      openModal("The mirror's hidden record", "🪞", `<p class="modal-copy">The mirror has nothing else to reveal. The hidden record is in your journal.</p><div class="clue-paper">“If the room agrees with every memory, one of them has been erased.”</div>`);
    } else {
      openModal("The mirror's edge", "🪞", `<p class="modal-copy">You run a finger along the mirror's frame. Near the lower edge, the backing paper has been disturbed.</p><p class="modal-copy">There is something hidden here, but you need to understand the mismatch first.</p>${action("Inspect the frame closely", "find-secret")}`);
    }
  }

  function findSecret() {
    if (!state.mirrorCompared || !state.computerFilesRead) {
      showToast("You don't yet know what makes the reflection unusual.");
      return;
    }
    if (!state.secretFound) {
      state.secretFound = true;
      addItem("Unindexed record");
      addClue("secret");
      showToast("A hidden record has been added to your journal.");
    }
    openModal("The unwritten entry", "🗝️", `<p class="modal-copy">Behind the mirror's backing paper is a tiny strip of thermal paper. It reads:</p><div class="clue-paper">IF THE ROOM AGREES WITH EVERY MEMORY, ONE OF THEM HAS BEEN ERASED.</div><p class="modal-copy">No date. No signature. This was never part of the visible record.</p>`);
  }

  function submitMirror(event) {
    event.preventDefault();
    const answer = $("#mirror-answer")?.value.trim().toUpperCase();
    if (answer === "VIOLET") {
      addItem("The word VIOLET");
      state.computerUnlocked = true;
      closeModal();
      showToast("GIRL.EXE accepts the password.");
      inspectComputer();
    } else {
      const error = $("#mirror-error");
      if (error) error.textContent = "Not quite. Reverse the letters one by one.";
    }
  }

  function inspectComputer() {
    if (!state.computerUnlocked) {
      openModal("GIRL.EXE has stopped responding", "🖥️", `
        <p class="modal-copy">The CRT flickers. A login prompt appears.</p>
        <div class="clue-paper">PASSWORD REQUIRED<br><small>HINT: TRUST THE MIRROR</small></div>
        <form id="computer-form">
          <label for="computer-password">Password</label>
          <input id="computer-password" class="game-input" name="password" autocomplete="off" placeholder="Enter password..." required>
          <button class="game-button" type="submit">Log in</button>
          <p class="error-message" id="computer-error" aria-live="polite"></p>
        </form>
        <p class="modal-copy">The diary warned that 1997 is not the answer. The mirror gives you a word.</p>`, "#computer-password");
      return;
    }
    if (!state.computerFilesRead) {
      state.computerFilesRead = true;
      addItem("Corrupted computer files");
      addClue("computer");
      addClue("testimony");
      setStory("Three files have been recovered. One contains a timestamp, one a changed diary entry, and one makes a claim that the other records cannot verify.");
      setMission("Compare the computer's room image with the mirror, then inspect the clock.");
      openModal("GIRL.EXE — recovered files", "🖥️", `
        <div class="clue-paper file-list" style="text-align:left">
          <p><strong>ROOM.LOG</strong></p><p>“11:47 PM. The room state froze during reconstruction.”</p><hr>
          <p><strong>DIARY.BAK</strong></p><p>“Backup saved before the sentence about the door was added.”</p><hr>
          <p><strong>USER.TXT</strong></p><p>“There was only one person in the room.”</p><p><em>This statement is not corroborated by any other file.</em></p><hr>
          <p><strong>ROOM_OLD.BMP</strong></p><p>An image of the bedroom. The mirror has a crack that is absent from the current room.</p><hr>
          <p><strong>DOOR_CODE.CORRUPT</strong></p><p>“Not the year. Use the first memory. Four digits. Month first, then day.”</p>
        </div>
        <p class="modal-copy">A file can preserve a claim without proving that the claim is true.</p>
        ${action("Compare the mirror", "close-and-mirror")}${action("Inspect the clock", "close-and-clock")}`);
      return;
    }
    openModal("GIRL.EXE — recovered files", "🖥️", `
      <div class="clue-paper file-list" style="text-align:left">
        <p><strong>ROOM.LOG</strong> — 11:47 PM, room state frozen.</p>
        <p><strong>DIARY.BAK</strong> — earlier version of the diary.</p>
        <p><strong>USER.TXT</strong> — “There was only one person in the room.” Unverified.</p>
        <p><strong>ROOM_OLD.BMP</strong> — mirror crack visible.</p>
      </div>
      <p class="modal-copy">${state.backupCompared ? "You have compared the backup with the diary." : "Compare the backup with the diary before drawing a conclusion."}</p>
      ${action("Compare DIARY.BAK", "compare-backup")}${action("Inspect the clock", "close-and-clock")}`);
  }

  function compareBackup() {
    if (!state.backupCompared) {
      state.backupCompared = true;
      addClue("backup");
      addItem("Earlier diary backup");
      setStory("The backup omits a sentence that appears in the current diary. The diary was changed after the backup; it cannot be treated as an untouched account.");
      setMission("Compare all three sources, then reconstruct the timeline.");
      showToast("New contradiction recorded.");
    }
    openModal("DIARY.BAK — comparison", "📄", `
      <div class="clue-paper" style="text-align:left">
        <p><strong>BACKUP:</strong> “At 11:47, the room went silent.”</p>
        <hr>
        <p><strong>CURRENT DIARY:</strong> “At 11:47, I watched her leave through the door.”</p>
      </div>
      <p class="modal-copy">The second sentence was added later. That proves the diary changed, but it does not prove why it changed or whether the added sentence is false.</p>`);
  }

  function inspectClock() {
    if (!state.computerUnlocked) {
      openModal("The bedside clock", "⏰", `<p class="modal-copy">The red digits are frozen at <strong>11:47</strong>. The clock is warm, as if it has been running, but the minute never changes.</p><p class="modal-copy">You cannot read the marks behind it clearly yet. The computer may explain what to look for.</p>`);
      return;
    }
    if (!state.clockChecked) {
      state.clockChecked = true;
      addItem("Scratched date");
      addClue("clock");
      setStory("Behind the clock is 10 / 31. It supports the date October 31, but a date alone cannot tell you which account of the night is true.");
      setMission("Compare the backup and the mirror discrepancy. Then solve the timeline.");
      openModal("Behind the frozen clock", "⏰", `
        <p class="modal-copy">You lift the clock. Scratched into the wood are two numbers:</p>
        <div class="clue-paper" style="font-size:30px;letter-spacing:4px">10 / 31</div>
        <p class="modal-copy">The computer says month first, then day. The diary calls October 31 the first night—but warns you that memories can be rewritten.</p>
        ${action("Return to the computer", "close-and-computer")}${action("Reconstruct the timeline", "timeline")}`);
    } else {
      openModal("The frozen clock", "⏰", `<div class="clue-paper">11:47 PM<br>Behind the clock: 10 / 31</div><p class="modal-copy">The date is supported by the marks, but the clock does not explain what happened at 11:47.</p>${action("Reconstruct the timeline", "timeline")}`);
    }
  }

  function openTimeline() {
    if (!state.backupCompared || !state.mirrorCompared || !state.clockChecked) {
      const missing = [];
      if (!state.backupCompared) missing.push("compare DIARY.BAK with the diary");
      if (!state.mirrorCompared) missing.push("compare the mirror with ROOM_OLD.BMP");
      if (!state.clockChecked) missing.push("inspect the clock");
      openModal("Not enough evidence yet", "🧩", `<p class="modal-copy">Before ordering the events, you still need to ${escapeHTML(missing.join(", "))}.</p>`);
      return;
    }
    if (state.timelineSolved) {
      openModal("Timeline reconstructed", "🧩", `<p class="modal-copy">You established that the diary changed after its backup, the mirror depicts a different room state, and the clock preserves the date 10 / 31.</p><div class="clue-paper">A RECORD IS NOT THE SAME AS THE EVENT IT DESCRIBES.</div>${action("Try the door", "close-and-door")}`);
      return;
    }
    openModal("Reconstruct the timeline", "🧩", `
      <p class="modal-copy">You have three conflicting sources. Which conclusion is actually supported by the evidence?</p>
      <form id="timeline-form">
        <label><input type="radio" name="deduction" value="one" required> USER.TXT proves there was only one person.</label>
        <label><input type="radio" name="deduction" value="two"> The diary and room image show different room states; at least one record changed or belongs to another moment.</label>
        <label><input type="radio" name="deduction" value="three"> The year 1997 is the door code because the computer file mentions it.</label>
        <button class="game-button" type="submit">Submit deduction</button>
        <p class="error-message" id="timeline-error" aria-live="polite"></p>
      </form>`);
  }

  function submitTimeline(event) {
    event.preventDefault();
    const answer = modalContent.querySelector('input[name="deduction"]:checked')?.value;
    if (answer === "two") {
      state.timelineSolved = true;
      state.theories.add("reconstruction");
      addClue("timeline");
      setStory("The room's records cannot all describe one consistent reality. The contradictions are evidence of reconstruction, not a puzzle to erase.");
      setMission("The date opens the door. Your interpretation determines what you find beyond it.");
      showToast("Deduction accepted. The door is ready.");
      openModal("A defensible conclusion", "🧩", `<p class="modal-copy">You have not solved every mystery, but you have separated evidence from assumption.</p><div class="clue-paper">THE RECORDS DISAGREE. THAT DISAGREEMENT IS THE CLUE.</div>${action("Inspect the door", "close-and-door")}`);
    } else {
      const error = $("#timeline-error");
      if (error) error.textContent = answer === "one"
        ? "The file makes that claim, but no independent evidence verifies it."
        : "A year mentioned in a file is not proof that it is the correct code.";
    }
  }

  function inspectDoor() {
    if (!state.computerFilesRead || !state.clockChecked) {
      openModal("The door won't open", "🚪", `<p class="modal-copy">A keypad lights up with four empty spaces. The computer hints at a date, but you need the evidence behind it.</p><div class="clue-paper">_ _ _ _</div>${action("Return to the room", "close-modal")}`);
      return;
    }
    openModal("The four-digit lock", "🚪", `
      <p class="modal-copy">The keypad accepts four digits. The clock supports 10 / 31, and the computer says month first. But opening the door won't settle what the records mean.</p>
      <form id="door-form">
        <label for="door-code">Enter the date (MMDD)</label>
        <input id="door-code" class="game-input" name="code" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="MMDD" autocomplete="off" required>
        <button class="game-button" type="submit">Unlock the door</button>
        <p class="error-message" id="door-error" aria-live="polite"></p>
      </form>`, "#door-code");
  }

  function submitDoor(event) {
    event.preventDefault();
    const code = $("#door-code")?.value.trim();
    if (code === "1997") {
      finishGame("loop");
      return;
    }
    if (code === "1030") {
      finishGame("wrong-memory");
      return;
    }
    if (code === "1031") {
      if (state.timelineSolved) {
        openFinalDeduction();
      } else {
        finishGame("exit");
      }
      return;
    }
    const error = $("#door-error");
    if (error) error.textContent = "The lock stays dark. Which month/day is supported by the clock and the computer—not just mentioned in a record?";
  }

  function openFinalDeduction() {
    openModal("Before you leave", "🚪", `
      <p class="modal-copy">The lock clicks, but the door does not open yet. The room asks one last question: what do you believe about the person described in USER.TXT?</p>
      <form id="final-form">
        <label><input type="radio" name="interpretation" value="trust" required> The file is right. There was only one person; the rest is a false memory.</label>
        <label><input type="radio" name="interpretation" value="evidence"> The file is unverified. I can explain the contradictions without pretending to know who was there.</label>
        <button class="game-button" type="submit">Leave the room</button>
        <p class="error-message" id="final-error" aria-live="polite"></p>
      </form>
      <p class="modal-copy">You can only choose what the evidence supports. You cannot force the records to agree.</p>`);
  }

  function submitFinal(event) {
    event.preventDefault();
    const choice = modalContent.querySelector('input[name="interpretation"]:checked')?.value;
    if (choice === "trust") {
      finishGame("wrong-memory");
      return;
    }
    if (choice === "evidence") {
      finishGame(state.secretFound ? "secret" : "truth");
    }
  }

  const endings = {
    loop: {
      title:"ENDING 1: THE LOOP", icon:"🔁", mission:"Ending unlocked: The Loop.",
      story:"You remembered the year, but not the night. The room has reset around you.",
      body:"You enter <strong>1997</strong>. The door opens onto the same bedroom. The lamp is on. The diary is open. The clock flickers from 11:47 to 11:46, then snaps back.<br><br>The computer wakes up: <strong>“YOU REMEMBERED THE YEAR. NOT THE NIGHT.”</strong><br><br>You have repeated the room's mistake: treating a label as proof."
    },
    exit: {
      title:"ENDING 3: THE EXIT", icon:"🚪", mission:"Ending unlocked: The Exit.",
      story:"You escaped the room, but the contradictions remain unresolved.",
      body:"You enter <strong>1031</strong>. The door opens into a quiet hallway washed in early-morning light. You leave without comparing every record.<br><br>Behind you, the CRT switches on. One line appears: <strong>“YOU FOUND THE DATE. NOT THE TRUTH.”</strong><br><br>You are free to leave. You still do not know what the room was built to hide."
    },
    "wrong-memory": {
      title:"ENDING 4: THE WRONG MEMORY", icon:"🪞", mission:"Ending unlocked: The Wrong Memory.",
      story:"You escaped after accepting an unverified statement as fact.",
      body:"You treat one fragment as the whole truth: either an unverified statement or a date lifted from a contradictory diary. The door opens, and the explanation feels complete for a moment.<br><br>Then the computer prints: <strong>“A RECORD CAN PRESERVE A CLAIM WITHOUT PROVING IT.”</strong><br><br>You escaped, but you turned incomplete evidence into certainty. The room did not have to deceive you. You completed the deception yourself."
    },
    truth: {
      title:"ENDING 5: THE RECONSTRUCTION", icon:"🌘", mission:"Ending unlocked: The Reconstruction.",
      story:"You left without forcing the evidence into a single convenient story.",
      body:"You compare the diary backup, the changed entry, the mirror image, and the clock. You establish that the room was assembled from records that cannot all be true in the same way.<br><br>Outside, the hallway is quiet. The computer's final message is not an answer but a warning: <strong>“WHAT YOU REMEMBER IS NOT WHAT THE ROOM REMEMBERS.”</strong><br><br>You escape with the strongest conclusion the evidence supports—and leave the parts it cannot prove unresolved."
    },
    secret: {
      title:"SECRET ENDING: THE UNWRITTEN ENTRY", icon:"🗝️", mission:"Secret ending unlocked: The Unwritten Entry.",
      story:"You found the record the room tried to keep outside its own story.",
      body:"Behind the mirror, you found a record that was never indexed by the computer: <strong>“IF THE ROOM AGREES WITH EVERY MEMORY, ONE OF THEM HAS BEEN ERASED.”</strong><br><br>You leave after rejecting the demand for a perfectly consistent story. The hallway lights switch off one by one. In the CRT's reflection, a new diary entry appears in your handwriting, dated tomorrow.<br><br><strong>“I knew you would come back.”</strong><br><br>The screen fades before you can tell whether the room predicted your return—or taught you to repeat it."
    }
  };

  function finishGame(type) {
    state.ending = type;
    closeModal();
    const ending = endings[type];
    setStory(ending.story);
    setMission(ending.mission);
    $(".wall")?.classList.remove("room-ending-true", "room-ending-loop");
    $(".wall")?.classList.add(type === "loop" ? "room-ending-loop" : "room-ending-true");
    openModal(ending.title, ending.icon, `
      <div class="ending">${ending.body}</div>
      <p class="modal-copy">Your journal preserves the evidence you actually found. Restart to investigate another path.</p>
      <button class="game-button" type="button" data-action="restart">Play again</button>`);
    if (type === "secret") showToast("Secret ending discovered.");
  }

  function restart() {
    Object.assign(state, {
      diaryRead:false, mirrorRead:false, mirrorCompared:false, secretFound:false,
      computerUnlocked:false, computerFilesRead:false, backupCompared:false,
      clockChecked:false, timelineSolved:false, ending:null,
      inventory:[], clues:[], theories:new Set(), returnFocus:null
    });
    renderInventory();
    renderJournal();
    setStory(initialStory);
    setMission("Investigate the diary and the mirror. Nothing in this room is guaranteed to be reliable.");
    $(".wall")?.classList.remove("room-ending-true", "room-ending-loop");
    closeModal();
    showToast("11:47 PM. The room begins again.");
  }

  document.querySelectorAll("[data-object]").forEach(button => button.addEventListener("click", () => {
    if (state.ending) {
      showToast("This ending is complete. Restart to explore another possibility.");
      return;
    }
    switch (button.dataset.object) {
      case "diary": inspectDiary(); break;
      case "mirror": inspectMirror(); break;
      case "computer": inspectComputer(); break;
      case "clock": inspectClock(); break;
      case "door": inspectDoor(); break;
      default: showToast("Nothing unusual here... yet.");
    }
  }));

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });

  modalContent.addEventListener("submit", event => {
    if (event.target.id === "mirror-form") submitMirror(event);
    if (event.target.id === "computer-form") {
      event.preventDefault();
      const answer = $("#computer-password")?.value.trim().toUpperCase();
      if (answer === "VIOLET") {
        state.computerUnlocked = true;
        closeModal();
        showToast("GIRL.EXE unlocked. New files recovered.");
        inspectComputer();
      } else {
        const error = $("#computer-error");
        if (error) error.textContent = "Access denied. The diary points you to the mirror.";
      }
    }
    if (event.target.id === "timeline-form") submitTimeline(event);
    if (event.target.id === "door-form") submitDoor(event);
    if (event.target.id === "final-form") submitFinal(event);
  });

  modalContent.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    switch (button.dataset.action) {
      case "close-modal": closeModal(); break;
      case "close-and-mirror": closeModal(); inspectMirror(); break;
      case "close-and-clock": closeModal(); inspectClock(); break;
      case "close-and-computer": closeModal(); inspectComputer(); break;
      case "close-and-door": closeModal(); inspectDoor(); break;
      case "compare-backup": compareBackup(); break;
      case "timeline": openTimeline(); break;
      case "secret-check": closeModal(); findSecret(); break;
      case "find-secret": findSecret(); break;
      case "restart": restart(); break;
    }
  });

  const style = document.createElement("style");
  style.textContent = `
    .room-ending-true { box-shadow: 0 0 0 4px #8e668f, 0 0 35px #bca6d6; filter: saturate(.72); }
    .room-ending-loop { box-shadow: 0 0 0 4px #5c465f, 0 0 35px #5c465f; filter: saturate(.55) hue-rotate(18deg); }
    .file-list hr { border: 0; border-top: 1px solid #e8a7cb; }
    #timeline-form, #final-form { text-align: left; }
    #timeline-form label, #final-form label { display: block; margin: 12px 0; padding: 10px; border: 1px solid #efd0e3; border-radius: 10px; background: #fff0f8; font-size: 13px; line-height: 1.6; }
    #timeline-form input, #final-form input { margin-right: 7px; accent-color: #d47fb0; }
    .modal-card { max-height: min(88vh, 760px); overflow-y: auto; }
    .modal-content { overflow-wrap: anywhere; }
  `;
  document.head.appendChild(style);

  renderInventory();
  renderJournal();
  setStory(initialStory);
  setMission("Investigate the diary and the mirror. Nothing in this room is guaranteed to be reliable.");
})();