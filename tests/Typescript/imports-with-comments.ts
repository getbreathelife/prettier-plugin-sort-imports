import { Component } from "@angular/core";
import z from 'z';
import { isEmpty } from "lodash-es";
import threeLevelRelativePath from "../../../threeLevelRelativePath";
import sameLevelRelativePath from "./sameLevelRelativePath";
import thirdParty from "third-party"; // third-party comment
import oneLevelRelativePath from "../oneLevelRelativePath";
// otherthing comment
import otherthing from "@core/otherthing";
import abc from "@core/abc";
import twoLevelRelativePath from "../../twoLevelRelativePath";
import component from "@ui/hello";  // @ui/hello comment
// fourLevelRelativePath comment
import fourLevelRelativePath from "../../../../fourLevelRelativePath";
import something from "@server/something";
import xyz from "@ui/xyz";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "ng-prettier";

  get text(): string {
    return isEmpty(this.title) ? "" : this.title;
  }
}
