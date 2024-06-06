/* ReSpec supports markdown formatting, but this shows up on the page before being rendered
Hence we render the markdown to HTML ourselves, this gives us
complete control over formatting and syntax highlighting */

'use strict';

/**
@author Frank Kilcommins <frank.kilcommins@gmail.com> //heavily inspired by work by Mike Ralphson on the OpenAPI-Specifications repo
@author Mike Ralphson <mike.ralphson@gmail.com>
**/

const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

const hljs = require('highlight.js');
const cheerio = require('cheerio');

let argv = require('yargs')
    .boolean('respec')
    .alias('r','respec')
    .describe('respec','Output in respec format')
    .default('respec',true)
    .string('maintainers')
    .alias('m','maintainers')
    .describe('maintainers','path to MAINTAINERS.md')
    .require(1)
    .argv;
const abstract = 'What is the Arazzo Specification?';
let maintainers = [];
let emeritus = [];

const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) { // && !argv.respec) {
          try {
              return '<pre class="nohighlight"><code>' +
                  hljs.highlight(str, { language: lang }).value +
                  '</code></pre>';
          } catch (__) { }
      }

      return '<pre class="highlight '+lang+'"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

function preface(title,options) {
    const respec = {
        specStatus: "base",
        editors: maintainers,
        formerEditors: emeritus,
        publishDate: options.publishDate,
        subtitle: 'Version '+options.subtitle,
        processVersion: 2017,
        edDraftURI: "https://github.com/OAI/Arazzo-Specification/",
        github: {
            repoURL: "https://github.com/OAI/Arazzo-Specification/",
            branch: "main"
        },
        shortName: "Arazzo",
        noTOC: false,
        lint: false,
        additionalCopyrightHolders: "the Linux Foundation",
        includePermalinks: true
    };

    let preface = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${md.utils.escapeHtml(title)}</title>`;

    // SEO
    preface += '<meta name="description" content="The Arazzo Specification provides a mechanism that can define sequences of calls and their dependencies to be woven together and expressed in the context of delivering a particular outcome or set of outcomes when dealing with API descriptions (such as OpenAPI descriptions)">';
    preface += '<link rel="canonical" href="https://spec.openapis.org/arazzo/latest.html" />';

    if (options.respec) {
        preface += '<script src="../js/respec-arazzo.js" class="remove"></script>';
        preface += `<script class="remove">var respecConfig = ${JSON.stringify(respec)};</script>`;
        try {
          preface += fs.readFileSync('./analytics/google.html','utf8');
        }
        catch (ex) {}
        preface += '</head><body>';
        preface += '<style>';
        preface += '#respec-ui { visibility: hidden; }';
        preface += 'h1,h2,h3 { color: #629b34; }';
        preface += 'a[href] { color: #45512c; }'; // third OAI colour is #8ad000
        preface += 'body:not(.toc-inline) #toc h2 { color: #45512c; }';
        preface += 'table { display: block; width: 100%; overflow: auto; }';
        preface += 'table th { font-weight: 600; }';
        preface += 'table th, table td { padding: 6px 13px; border: 1px solid #dfe2e5; }';
        preface += 'table tr { background-color: #fff; border-top: 1px solid #c6cbd1; }';
        preface += 'table tr:nth-child(2n) { background-color: #f6f8fa; }';
        preface += 'pre { background-color: #f6f8fa !important; }';
        preface += fs.readFileSync(path.resolve(__dirname,'gist.css'),'utf8').split('\n').join(' ');
        preface += '</style>';
        preface += `<h1 id="title">${title.split('|')[0]}</h1>`;
        preface += `<section id="abstract" title="${abstract}">`;
        preface += 'The Arazzo Specification provides a mechanism that can define sequences of calls and their dependencies to be woven together and expressed in the context of delivering a particular outcome or set of outcomes when dealing with API descriptions (such as OpenAPI descriptions).';
        preface += '</section>';
        preface += '<section class="notoc" id="sotd">';
        preface += '<h2>Status of This Document</h2>';
        preface += 'The source-of-truth for the specification is the GitHub markdown file referenced above.';
        preface += '</section>';
    }
    else {
        preface += '</head><body>';
    }
    return preface;
}

function doMaintainers() {
    let m = fs.readFileSync(argv.maintainers,'utf8');
    let h = md.render(m);
    let $ = cheerio.load(h);
    let u = $('ul').first();
    $(u).children('li').each(function(e){
        let t = $(this).text().split('@')[0];
        maintainers.push({name:t});
    });
    if ($("ul").length < 2) return;
    u = $("ul").last();    
    $(u).children('li').each(function(e){
        let t = $(this).text().split('@')[0];
        emeritus.push({name:t});
    });
}

function getPublishDate(m) {
    let result = new Date();
    let h = md.render(m);
    let $ = cheerio.load(h);
    $('table').each(function(i,table){
        const h = $(table).find('th');
        const headers = [];
        $(h).each(function(i,header){
            headers.push($(header).text());
        });
        if (headers.length >= 2 && headers[0] === 'Version' && headers[1] === 'Date') {
            let c = $(table).find('tr').find('td');
            let v = $(c[0]).text();
            let d = $(c[1]).text();
            argv.subtitle = v;
            if (d !== 'TBA') result = new Date(d);
        }
    });
    return result;
}

if (argv.maintainers) {
    doMaintainers();
}

let s = fs.readFileSync(argv._[0],'utf8');

if (argv.respec) {
    argv.publishDate = getPublishDate(s);
}

let lines = s.split('\r').join().split('\n');

let prevHeading = 0;
let lastIndent = 0;
let inTOC = false;
let inDefs = false;
let inCodeBlock = false;
let bsFix = true;

let indents = [0];

// process the markdown
for (let l in lines) {
    let line = lines[l];
    let linkTarget;

    if (line.startsWith('## Table of Contents')) inTOC = true;
    if (line.startsWith('<!-- /TOC')) inTOC = false;
    if (inTOC) line = '';

    if (line.startsWith('## Definitions')) {
        inDefs = true;
        bsFix = false;
    }
    else if (line.startsWith('## ')) inDefs = false;

    if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        line += '\n'; // fixes formatting of first line of syntax-highlighted blocks
    }

    if (!inCodeBlock && line.startsWith('#')) {
        let indent = 0;
        while (line[indent] === '#') indent++;
        let originalIndent = indent;

        let prevIndent = indents[indents.length-1]; // peek
        let delta = indent-prevIndent;

        if (!argv.respec) {
            if (delta===0) indent = lastIndent
            else if (delta<0) indent = lastIndent-1
            else if (delta>0) indent = lastIndent+1;
        }

        if (indent < 0) {
            indent = 1;
        }
        if (argv.respec && (indent > 1)) {
            indent--;
        }
        let newIndent = indent;
        if (!argv.respec && (indent <= 2) && bsFix) {
            newIndent++;
        }

        if (line.indexOf('<a name=')>=0) {
            let comp = line.split('</a>');
            let title = comp[1];
            if (inDefs) title = '<dfn>'+title+'</dfn>';
            let link = comp[0].split('<a ')[1].replace('name=','id=');
            const anchor = link.split("'").join('"').split('"')[1];
            line = '#'.repeat(newIndent)+' <span>'+title+'</span>';
            linkTarget = '<a id="'+anchor+'"></a>';
        }
        else {
            let title = line.split('# ')[1];
            if (inDefs) title = '<dfn>'+title+'</dfn>';
            line = ('#'.repeat(newIndent)+' '+title);
        }

        if (delta>0) indents.push(originalIndent);
        if (delta<0) {
            let d = Math.abs(delta);
            while (d>0) {
                indents.pop();
                d--;
            }
        }
        lastIndent = indent;
    }

    if (line.indexOf('"></a>')>=0) {
        line = line.replace(' name=',' id=');
        line = line.replace('"></a>','"> </a>');
    }

    line = line.split('\\|').join('&#124;'); // was &brvbar

    if (!inCodeBlock) {

        // minor fixups to get RFC links to work properly
        if (line.indexOf('RFC [')>=0) {
            line = line.replace('RFC [','[RFC');
        }
        line = line.replace('[Authorization header as defined in ','Authorization header as defined in [');

        if (line.indexOf('[RFC')>=0) {
            line = line.replace(/\[RFC ?([0-9]{1,5})\]/g,function(match,group1){
                console.warn('Fixing RFC reference',match,group1);
                return '[[!RFC'+group1+']]';
            });
        }

        line = line.replace('http://tools.ietf.org','https://tools.ietf.org');
        if (line.indexOf('xml2rfc.ietf.org')>0) {
            line = line.replace('https://xml2rfc.ietf.org/public/rfc/html/rfc','https://tools.ietf.org/html/rfc');
            line = line.replace('.html','');
        }

        //handle url fragments in RFC links and construct section titles links as well as RFC links
        line = line.replace(/\]\]\(https:\/\/tools.ietf.org\/html\/rfc([0-9]{1,5})(\/?\#.*?)?\)/g, function(match, rfcNumber, fragment) {
            if (fragment) {
                // Extract section title from the fragment
                let sectionTitle = fragment.replace('#', '').replace(/-/g, ' ');
                sectionTitle = sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1); // Capitalize the first letter
                return `]] [${sectionTitle}](https://tools.ietf.org/html/rfc${rfcNumber}${fragment})`;
            } else {
                return ']]';
            }
        });
    }

    if (!inCodeBlock && line.indexOf('](../') >= 0) {
        const regExp = /\((\.\.[^)]+)\)/g;
        line = line.replace(regExp,function(match,group1){
          console.warn('Fixing relative link',group1,line);
          return '('+url.resolve('https://github.com/OAI/Arazzo-Specification/tree/main/versions/foo',group1)+')';
        });
    }

    if (!inCodeBlock && argv.respec && line.startsWith('#')) {
        let heading = 0;
        while (line[heading] === '#') heading++;
        let delta = heading-prevHeading;
        if (delta>0) delta = 1;
        //if (delta<0) delta = -1;
        if (Math.abs(delta)>1) console.warn(delta,line);
        let prefix = '';

        // heading level delta is either 0 or is +1/-1, or we're in respec mode
        /* respec insists on <section>...</section> breaks around headings */

        if (delta === 0) {
            prefix = '</section><section>';
        }
        else if (delta > 0) {
            prefix = '<section>'.repeat(delta);
        }
        else {
            prefix = '</section>'+('</section>').repeat(Math.abs(delta))+'<section>';
        }
        prevHeading = heading;
        line = prefix+md.render(line);
    }

    lines[l] = (linkTarget ? linkTarget : '') + line;
}

s = preface(`The Arazzo Specification v${argv.subtitle} | Introduction, Definitions, & More`,argv)+'\n\n'+lines.join('\n');
let out = md.render(s);
out = out.replace(/\[([RGB])\]/g,function(match,group1){
    console.warn('Fixing',match,group1);
    return '&#91;'+group1+'&#93;';
});
console.log(out);
