import { Component } from "@angular/core";
import { isEmpty } from "lodash-es";
// third-party comment
import thirdParty from "third-party";
import z from "z";

import abc from "@core/abc";
import otherthing from "@core/otherthing"; // otherthing comment
import something from "@server/something";
// @ui/hello comment
import component from "@ui/hello";
import xyz from "@ui/xyz";

// fourLevelRelativePath comment
import fourLevelRelativePath from "../../../../fourLevelRelativePath";
import threeLevelRelativePath from "../../../threeLevelRelativePath";
import twoLevelRelativePath from "../../twoLevelRelativePath";
import oneLevelRelativePath from "../oneLevelRelativePath";
import sameLevelRelativePath from "./sameLevelRelativePath";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title = "ng-prettier";

    get text(): string {
        return isEmpty(this.title) ? "" : this.title;
    }
}
