import scrapy


class CompaniesScraperSpider(scrapy.Spider):
    name = "companies_scraper"
    allowed_domains = ["techbehemoths.com"]
    base_url = "https://techbehemoths.com/companies"
    page_number = 1  # Start with the first page

    def start_requests(self):
        # Start scraping from the first page
        yield scrapy.Request(url=f"{self.base_url}?page={self.page_number}", callback=self.parse)

    def parse(self, response, **kwargs):
        # Extract company details from the current page
        company_cards = response.css("article.co-box.bg-white.relative")  # Select each company card

        for card in company_cards:
            company_link = card.css(
                "div.co-box__btns.items-center.f-space-between > a::attr(href)"
            ).get()
            company_name = card.css("p.co-box__name.font-medium > a::text").get()
            location = ", ".join(card.css("span.co-box__loc-itm a::text").getall())

            if company_link:
                company_url = f"https://techbehemoths.com{company_link}"
                meta_data = {
                    "company_name": company_name.strip() if company_name else "N/A",
                    "location": location.strip() if location else "N/A",
                }
                yield scrapy.Request(
                    url=company_url, callback=self.parse_company, meta=meta_data
                )

        # Handle pagination by incrementing the page number
        if company_cards:  # Check if there are companies on the current page
            self.page_number += 1
            next_page_url = f"{self.base_url}?page={self.page_number}"
            yield scrapy.Request(url=next_page_url, callback=self.parse)

    @staticmethod
    def parse_company(response):
        # Extract metadata passed from parse()
        company_name = response.meta.get("company_name", "N/A")
        location = response.meta.get("location", "N/A")

        # Extract details from the company's page
        site = response.css(
            "a.btn.relative.btn-outlined.btn-black.btn-special > span.val.ellipsis::text"
        ).get()
        number = response.css(
            "a.btn-outlined:nth-child(2) > span:nth-child(2)::text"
        ).get()
        services = response.css(".services-list > li > a > span.txt::text").getall()

        yield {
            "company_name": company_name,
            "location": location,
            "site": f"https://{site.strip()}" if site else "N/A",
            "number": number.strip() if number else "N/A",
            "services": services or [],
        }
