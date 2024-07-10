import puppeteer from 'puppeteer';
import fs from 'fs';
import { Request, Response } from 'express';

const getLinks = async (request: Request, response: Response) => {
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 6000000,
    });
    const page = await browser.newPage();
    await page.goto("https://www.trabalhabrasil.com.br/vagas-empregos-em-cianorte-pr?fh=home-office");



    let allLinks: any[] = [];

    const scrapePage = async (currentPage: number) => {
        await page.waitForSelector('a.jobCard');
        const jobData = await page.evaluate(() => {
            const jobCards = document.querySelectorAll('a.jobCard');
            const jobs: { link: string }[] = [];

            jobCards.forEach(card => {
                const link = (card as HTMLAnchorElement).href;
                jobs.push({ link });
            });

            return jobs;
        });

        allLinks = allLinks.concat(jobData);

        const countPagination = await page.evaluate(() => {
            let cont = 0;
            const tamJobCards = document.querySelectorAll('.pagination__list')[0].childNodes;

            tamJobCards.forEach(item => {
                if (item.nodeName === 'LI') {
                    if (Number(item.textContent) > cont) {
                        cont = Number(item.textContent);
                    }

                }
            });
            return cont;
        });
        if (currentPage == 100) return;
        if (currentPage < countPagination) {
            console.log(countPagination)
            await page.goto(`https://www.trabalhabrasil.com.br/vagas-empregos-em-cianorte-pr?fh=home-office&pagina=${currentPage + 1}`);
            await scrapePage(currentPage + 1);
        }
    };

    await scrapePage(1);

    fs.writeFileSync('links.json', JSON.stringify(allLinks, null, 2), 'utf8');

    await browser.close();
    response.send()
};

const getInfos = async (request: Request, response: Response) => {
    const fileJsonLinks = fs.readFileSync('links.json', 'utf8')

    const listLinks: { link: string }[] = JSON.parse(fileJsonLinks)

    const browser = await puppeteer.launch({ headless: true });
    let allInfos: any[] = [];

    for (let index = 0; index < listLinks.length; index++) {

        const page = await browser.newPage();
        const element = listLinks[index].link;
        console.log("scrapepr link", element)

        await page.goto(element, {
            waitUntil: 'networkidle2',
            timeout: 600000
        });
        const datas = await page.evaluate(() => {
            const cardDescrible = document.querySelector('.jobView h1')?.textContent
            const infos = document.querySelectorAll('.box')
            const infosList: any[] = []
            infos.forEach(infos => {
                const splitInfo = infos.textContent?.split(':')
                if (splitInfo) {
                    infosList.push(
                        {
                            label: splitInfo[0]?.trim(),
                            value: splitInfo?.slice(1, splitInfo.length)
                        }
                    )
                }
            })
            return {
                title: cardDescrible?.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim(),
                infosAdd: infosList,
                link: document.location.href
            }
        })
        console.log(datas)
        allInfos = allInfos.concat(datas)
        await page.close()
        if (index % 10 == 0) {
            fs.writeFileSync('infosJob.json', JSON.stringify(allInfos, null, 2), 'utf8');
        }
    }
    await browser.close();



    console.log('finished')

    response.send()
};

export {
    getLinks,
    getInfos
}
