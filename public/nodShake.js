class YesOrNo {


  constructor(img_tri, img_still, img_anim, triX, triY, yes) {
    this.arrow = img_tri;
    this.still = img_still
    this.anim = img_anim;
    this.arrowX = triX;
    this.arrowY = triY;

    // if it's true, this object is for the Yes option. If not, this object is for the No option.
    this.yes = yes;

    this.arrowW = 114;
    this.arrowH = 72;

    if (this.yes) this.textX = this.arrowX + 3;
    else this.textX = this.arrowX - 3;
    this.textY = this.arrowY + 290;

    this.headX = this.arrowX - 22;
    this.headY = this.arrowY + 103;
    this.headSize = 160;

    this.init();

  }



  init() {

    this.animCnt = 0;
    this.bounceCnt = 0;
    this.dyYes = 0;
    this.dyNo = 0;
    this.down = true;

    if (this.yes) this.optX = this.arrowX + 29;
    else this.optX = this.arrowX + 41;
    this.optY = this.arrowY - 30;

  }



  displayText() {

    if (this.yes) image(this.arrow, this.arrowX, this.arrowY + this.dyYes, this.arrowW, this.arrowH);

    else image(this.arrow, this.arrowX, this.arrowY + this.dyNo, this.arrowW, this.arrowH);


    push();
    textAlign(LEFT);
    textFont(font_roboto_light_italic);
    textSize(20);
    fill(255);
    if (this.yes) text("Nod your head", this.textX, this.textY);
    else text("Shake your head", this.textX, this.textY);
    pop();

  }



  pause() {

    image(this.still, this.headX, this.headY, this.headSize, this.headSize);

  }



  animate() {

    if (this.animCnt < 4) image(this.anim[0], this.headX, this.headY, this.headSize, this.headSize);
    else image(this.anim[1], this.headX, this.headY, this.headSize, this.headSize);

    if (this.animCnt < 7) this.animCnt++;
    else this.animCnt = 0;

  }



  bounce(ans) {

    if (this.down) {	// bouncing down
      if (ans == 0) {
        if (this.dyYes > -12) this.dyYes -= 4;
        else this.down = false;
      }
      else if (ans == 1) {
        if (this.dyNo > -12) this.dyNo -= 4;
        else this.down = false;
      }
    }
    else {	// bouncing up
      if (ans == 0) {
        if (this.dyYes < 12) this.dyYes += 4;
        else this.down = true;
      }
      else if (ans == 1) {
        if (this.dyNo < 12) this.dyNo += 4;
        else this.down = true;
      }
    }

  }

  isClicked(x, y) {
    if (x > this.headX && x < (this.headX + this.headSize) && y > this.arrowY && y < this.textY) return true;
    else return false;
  }


}
