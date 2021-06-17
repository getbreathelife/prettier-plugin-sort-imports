import { Component } from '@angular/core';
import thirdParty from 'third-party';
// prettier-ignore
import z from 'z';

// prettier-ignore
import a from 'a';

import { isEmpty } from 'lodash-es';
// prettier-ignore
export class AppComponent {
    title = "ng-prettier";

    get text(): string {
        return isEmpty(this.title) ? "" : this.title;
    }

}

import abc from '@core/abc';
import otherthing from '@core/otherthing';

import something from '@server/something';

import component from '@ui/hello';
// prettier-ignore
const x = 1;
import xyz from '@ui/xyz';

import fourLevelRelativePath from '../../../../fourLevelRelativePath';
import threeLevelRelativePath from '../../../threeLevelRelativePath';
import twoLevelRelativePath from '../../twoLevelRelativePath';
import oneLevelRelativePath from '../oneLevelRelativePath';
import sameLevelRelativePath from './sameLevelRelativePath';
