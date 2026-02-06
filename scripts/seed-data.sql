-- Database Seed Script
-- Generated automatically from example/books.json and example/users.txt
-- Generated at: 2026-02-06T05:08:31.220Z

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM borrowings;
-- DELETE FROM users;
-- DELETE FROM books;

-- ============================================
-- Insert Users
-- ============================================

INSERT INTO users (unit, username, password, role) VALUES ('施工室', 'tcb033235', 'tra033235', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('養路室', 'tcb033234', 'tra033234', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('產業室', 'tcb033236', 'tra033236', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('職安室', 'tcb033290', 'tra033290', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('政風室', 'tcb033290', 'tra033290', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('總務室', 'tcb033233', 'tra033233', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('苗工所', 'tcb033457', 'tra033457', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('甲工所', 'tcb032667', 'tra033267', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('彰工所', 'tcb032238', 'tra032238', 'user');
INSERT INTO users (unit, username, password, role) VALUES ('人事室', 'tcb033292', 'tra033292', 'admin');

-- ============================================
-- Insert Books
-- ============================================

INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40789', 114, 'available', '沒有砲火的戰爭', 'Mark Galeotti', '高寶', '2023', '使用槍枝、炸彈和無人機進行戰鬥的傳統衝突，已經變得太昂貴而無法發動，不受歡迎，也難以管理。 想對侵略者施加壓力、減輕外國影響力作戰的衝擊，就需要知道什麼時候我們正被蒙住眼睛、哄騙並操縱。要在大國博弈中夾縫求生、擴大影響力，必須掌握三種能力： 一、吸引力：我們要與哪個國家有共同點，並讓它喜歡我們。 二、正當性：哪個國家有正確的價值觀，或站在歷史上正確的一方。 三、議題設定：如何問出正確的問題。 國際安全與俄羅斯專家Mark Galeotti提供一套全面且開創性的調查，展示了新形態戰爭如何透過虛假信息、間諜活動到犯罪以及顛覆一切達到目的，並詳細說明該如何生存、適應和利用這一新現實所帶來的機會。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40789/bb50eee1-131a-4363-8264-3d981d350337@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40790', 114, 'available', '巴奈回家', '巴奈、徐璐', '時報文化', '2024', '漫長歷史上，原住民族從原來的聚落被強制遷徙，「被迫」放棄名字、語言、祖先的承繼，在從屬於他者的生活方式裡，逐漸喪失了自己的歷史記憶、傳統和山林文化……。抗爭七年間彷彿過去處境重演，他們的身影在不斷地驅趕中遠離大眾的視野，但這次，已經踏上「回家」的腳步將不會停。 這本書首度寫出巴奈的成長故事，更寫出原住民族群被迫離開家園、失去土地的歷史。這是一本讓人熱血沸騰的書，也是原住民族生命和歷史的縮影。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40790/a0a5e470-402b-454c-8224-3dc81dc586f3@710x470.png');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40791', 114, 'available', '精準敘事', '洪震宇', '漫遊者文化', '2023', '精準敘事是一套思考與表達的方法，幫助你把零碎的經驗與知識細節編成好故事。作者鼓舞每個讀者，有意識地細心栽培故事的種子，才能活出好故事，並能以開放的好奇心挖掘故事，為別人帶來驚奇與感動。 作者長年接觸不同業種的企業、學校、政府組織、社區與部落，與學員實際演練如何在工作與專業上運用敘事手法。本書的實戰篇提出五種情境，說明許多專業領域都需要敘事力的基本功： ——用故事傳達你的專業：提案簡報如何能勝出？如何準備精彩的演講？ ——讓人有感的敘事寫作：如何寫出一般大眾看得懂的新聞稿和科學成果報告？ ——企業的內部溝通：以好故事供內部學習、做跨部門學習。 ——教室裡的敘事教學力：將故事融入教學，增進師生互動對話。 ——敘事創生力：找出地方街區與小鎮故事呈現地方特色，豐富導覽的趣味與深度。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40791/e9c1a433-3236-4eb1-add6-9b60f9cd4996@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40793', 114, 'available', '修辭的政治', '康文炳', '允晨文化', '2023', '從傳統的政治宣傳到網路認知作戰，話語的修辭已經成為一種精良的政治武器；藉助社群媒體的活躍，傳播途徑的普及化，加深了社會意識形態的分裂。在這個意識形態驅動話語的時代，我們比過去任何一個時代更迫切地需要培養獨立思考的閱聽能力。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40793/96656f7e-f3d2-4840-ab40-52943b6e53f8@710x470.png');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40794', 114, 'available', '超智慧', 'Nick Bostrom', '感電', '2023', '本書作者從當前人工智慧研究和現況中，找出可能達成超智慧的途徑，包括人工智慧、全腦仿真、生物認知、腦機介面、網路和組織的強化，並帶領我們思考，這樣一個超智慧一旦出現，可能會如何行動，以及它的行動是否會對我們的生存造成威脅，而我們是否有方法在它變成超智慧之前，該如何做好能力控制和動機選擇。 身為牛津大學哲學系教授，作者特別強調動機選擇的關鍵性，但要植入哪一種價值的決定，有非常深遠的影響；而人類的價值又如何能轉譯成人工智慧所能理解的形式語言。這些都是嚴峻的挑戰。作者從頭到尾都謹慎地為人類尋找出路。 在這本極具創見的書中，呈現了超智慧的前景和面臨的挑戰，以及我們該如何應對。這可能是人類有史以來要面對的最重要、最艱難挑戰。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40794/67e3de7b-c3cd-4db4-b9eb-249026a7e780@710x470.png');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40795', 114, 'available', '移工築起的地下社會', '簡永達', '春山', '2023', '從二〇一六到二〇二三年，從臺灣到越南，獨立記者簡永達持續跨國追蹤臺灣移工議題，除了描繪鮮活的移工故事、他們在工作中所面臨的困境與危機外，也深入制度面，討論職災補償機制與移工寶寶所觸及的人權議題。此外，本書更從國際政經結構出發，討論族裔經濟的興起、跨國遷移的仲介角色、國際搶工的趨勢以及國際品牌對於供應鏈勞權的關注，如何影響臺灣移工的處境，是近年來理解臺灣移工與勞動現場全面且重要的調查報導。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40795/45cb39f0-16da-4bb6-bc51-9f89e667c1be@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40796', 114, 'available', '誘因設計', 'Uri Gneezy', '天下文化', '2023', '生活中或職場裡，你是否遇過， 那些說是鼓勵「團隊合作」，卻將「個人成功」設計為獎勵辦法的標準？ 或者美其名說，要鼓勵「創新」卻「懲罰失敗」的規則？ 更或是強調「品質至上」的公司，卻用「數量」來計算員工績效的狀況？ 還是你是主管或父母親，急於試圖想要設計出一套讓員工或孩子按照你的要求做，卻總是不得其法？或搞錯方向？ 行爲經濟學家Uri Gneezy，用上述的真實場景來告訴我們，為什麼我們所提供的誘因總是失敗？或不得其法？他的答案是「我們所提出的誘因，充滿『混合訊號』。」', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40796/3e017af4-edd2-471d-98ff-f8aab2a36df0@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40797', 114, 'available', '沒有小孩的她們', 'Peggy O’Donnell Heffington', '衛城', '2023', '其實，影響女人生育抉擇的因素有很多， 從生涯規劃，到害怕能否照顧孩子；從無法生育，到擔心環境危機……。 古往今來，許多女性，都曾在盡力過好這一生的掙扎中，苦苦思索生活中是否有容納小孩的空間？無論她們做出什麼的選擇，都不免受到所處背景的影響──時代、社會、文化，是適合生孩子，或是不適合？ 本書超越社會為母職、非母職劃下的界線， 看到各個時代，女性面對的抉擇，或難以抉擇。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40797/179be7f5-e0b7-475d-9fba-19ddc9434de3@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40800', 114, 'available', 'AI世界的底層邏輯與生存法則', '程世嘉', '天下文化', '2024', 'AI 只是標配，思考才是你的武器， 取代你的人，是會用 AI 的人! 史丹佛電腦科學專家程世嘉，深入淺出，轉譯AI 帶來的質變，搞懂AI世界的底層邏輯和生存法則，讓你在工作、學習、商業上全面超車。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40800/77295293-499f-41ce-8c7d-98af2426745b@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40801', 114, 'available', '深刻認識一個人', 'David Brooks', '天下文化', '2024', '作者有感於現代人活在充滿政治對立、缺乏人性的科技世界和裂解的社會之中，彷彿人與人之間失去互相了解的能力，對彼此視若無睹。因此他探究造成這些危機的深層原因，列出以下三點，告訴我們如何真正了解別人，進而在家庭、職場和生活中締造更深刻的人際關係。 ✶我看見你 一個人可能很愛你，卻不了解你。學習當個「照亮者」，散發光和熱，不管遇見什麼人，都能讓人展現光亮耀眼的一面。 ✶我看到了你的磨難 挖掘人生不是獨自進行的。透過分享悲傷，一起思考悲傷的意義，我們才能學習克服恐懼，對彼此有更深的了解。 ✶我看到你的力量 用同情和理解的眼光來看身邊的人，就會看到他們複雜的靈魂和痛苦，也能看到他們如何努力展翅，駕馭人生。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40801/40406600-42ae-4a19-b1ac-a71c57c11f74@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40802', 114, 'available', '如果孤獨死將是大多數人的未來', '李夏苹', '網路與書', '2024', '作者初入職場時，曾短暫待過殯葬業、賣過線上遊戲寶物、做過房地產廣告文案和翻譯機中文編輯，但都待不久。求職不順的她努力考上了公務員，原本在區公所處理文化行政業務，突然被調到社會課，負責老人福利櫃檯業務。有一天她被交辦處理一項「點交獨居老人遺產」的工作，讓她心中生起莫名恐懼，且冒出許多執行流程的疑問，「如果第一線的我們都不知道要怎麼做，那麼，一般人應該更難清楚國家是怎麼處理獨居老人的遺體和遺產？」為此她透過訪談、研究，並添入職場實際案例及個人反思來撰寫此書，試圖勾勒出老死大事在國家機器下可能的面貌，以及人們可以如何安排老後生活的誠摰建議。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40802/e870187e-d2ec-433c-9cd7-0e1786ba1162@710x470.png');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('114-40803', 114, 'available', '儀式的科學', 'Dimitris Xygalatas', '鷹出版', '2024', '儀式是人類文化史上最古老也最神祕的泉源，幾乎在每個人類文化中都存在。而儀式的存在，滿足了基本人類需求，也幫助我們解決問題。但我們仰賴這些禁得起時間考驗的傳統，並不是因為它們具有邏輯，而是因為它們對我們來說很有用。即使這些儀式行為對於物質世界沒有直接影響，卻改變了我們的內在世界，透過身體實踐過程中，產生秩序、歡愉、黏著、幸福感等心理機制，形塑了我們的社會角色，以深刻又微妙的機制將所有人連結在一起。 本書由先驅人類學家帶領讀者踏上一段「引人入勝」的旅程，穿越人類儀式的豐富掛毯，向我們展示儀式的運作邏輯，說明儀式這種看似最不合理的行為，為何對我們來說如此重要。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/40803/66b7277b-7c7a-44cd-809d-24e396182d51@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42405', 113, 'available', '逆思維', 'Adam Grant', '平安文化', '2022', '每個人都習慣用最舒適的方式思考，不願挑戰自我，擔心質疑自己會讓世界變得難以預期，甚至威脅到自我身分認同，於是，成見不斷延續，聰明變成盲點，知識令人劃地自限。作者告訴我們，想要擺脫認知惰性就必須建立「科學家模式」，而科學家的基礎就是重新思考，進行反思。科學家模式中，我們的想法不會妄下定論，而是讓問題帶著我們前進，因為反思的關鍵不在於對錯，而是明白自己的欠缺及不足。本書教我們只要定期重新思考，凡事再想一下下，就能掙脫成見的束縛，創造共好、雙贏的局面！', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42405/597fdc99-b390-4e0b-ae05-a06dddc8c2c9@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42406', 113, 'available', '永續力', '社企流＆ 願景工程基金會', '果力文化', '2022', '現今世界面臨許多挑戰，為回應環境及社會問題，並維護地球永續繁榮，聯合國制定17項「永續發展目標」（SDGs）以作為各國政府、社會、企業部門等的共同指引。本書介紹當前熱門的永續新知，精選 32組成功國際案例，以及台灣17組涵蓋非營利組織、社會企業、CSR企業的指標型案例。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42406/22a7f198-8df6-433f-83c7-34fdbf8d18f1@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42407', 113, 'available', '當個普通人也很自豪', '吳媛媛', '天下雜誌', '2022', '移居瑞典的台灣作者，以開放的態度記錄瑞典簡單日常，發現每一種選擇其背後都其來有自，除了稱羨瑞典的成果，理解其脈絡也很重要。她觀察瑞典安靜的選舉文化如何打造理性的公民與社會，以及在每一個生活環節裡，瑞典人如何體貼不同階層的公民在投票日外的每一天，實現民主的生活。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42407/6758a013-e826-4d84-8050-7d943b756bbe@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42408', 113, 'available', '現代世界六百年', 'Robert B. Marks', '春山', '2022', '在我們習以為常的認知裡，現代世界的起源始於十五、十六世紀歐洲各國向外探險而開啟的大航海時代，從此西方走上崛起之路，成為推動與形塑現代世界的核心且唯一力量。於是，有關現代世界的歷史著作幾乎都聚焦於歐洲，此即為「歐洲中心論」。本書作者的目標就是要帶領讀者跳脫歐洲中心視角，改從更為寬廣與平等，及利於展現區域互動與結構性因素的全球視野，重新理解我們現今的世界係如何形成的。書中以兩條別出心裁的敘事線：一為突出亞洲（以中國和印度為主）的地位，二為強調環境的影響，貫穿它所要說的從十五至二十一世紀現代世界史故事。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42408/8b498929-0503-4048-83f5-7944dec3db23@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42409', 113, 'available', '推倒高牆', 'Rosabeth Moss Kanter', '天下雜誌', '2022', '每個棘手難題的背後都有既得利益，僵固難解要突破，轉彎發揮影響力，在在勝過正面對擊。本書作者是全球頂尖的組織變革專家，她處理世界上複雜混亂的問題，克服麻木的制度，提出可落實的創新，促成變革的管理模式「進階領導力」。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42409/1c8945bc-9fc0-449e-8908-29f6e93fcd4f@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42410', 113, 'available', '失序的心靈', 'Robert Bellah等', '八旗文化', '2023', '本書認為在過分強調個人主義的社會中，會少了群體趨向「共善」之道德指標。過度的個人主義會讓我們不斷退縮回自己的小圈子，呈現某種疏離和孤立狀態，不關心公共議題也不看重傳統的信念價值，例如重視家庭、守望社區、忠於國家等。那本書理想的公民社會是什麼？我們又該如何追尋？本書認為仍可以透過教育重塑讓人們重拾道德責任，了解人生追尋的不只個人成功，且成功不只是因為個人很努力。我們對社會仍有更多的責任與義務，人際孤立係現代社會遇到的普世困境，也是每一位關心公共事務與社會責任的你我應該關注的課題。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42410/52a0352c-f0b2-437a-8286-d77ab7c31003@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42411', 113, 'available', '走進布農的山', '郭彥仁（郭熊）', '大家出版', '2022', '本書作者從2008年開始跟著一群布農族長者，在一座森林裡探索，透過此書帶我們看見整座森林，我們將會如同森林裡的複眼人，同時用許多雙眼睛觀察森林—有動物、植物、季節、人文與個人反思的視野，而這些視角相互揉雜於同一篇文章內，形成對於這片森林的豐富描寫，帶我們看見這座森林當下之樣貌。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42411/a4085886-7bb3-428b-b5d5-40fcbebe2f00@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42412', 113, 'available', '高齡友善新視界', '周傳久', '巨流', '2019', '作者長期關注高齡政策，實際走訪各國觀察，並體驗照顧之觀念與方法，藉由本書針對臺灣照顧領域現況提出建言，期待臺灣發展因地制宜的照顧模式，營造令人嚮往之高齡友善社會。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42412/b1a2ca60-3921-4f22-bf14-7d1280fc7bb6@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42413', 113, 'available', '正向談判', '戚樹誠', '聯經', '2022', '談判學問存在於你我日常之間，不論是職場開口加薪、買賣議價或是人際相處，用彈性靈活的方式，運用談判理論就能創造令人驚訝的理想結果！本書為戚樹誠教授首度公開多年來在台大開課課堂內容，以輕鬆詼諧的方式指引何謂正向談判！', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42413/935a2ed3-478e-4e60-9a9a-fa2e550843af@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42414', 113, 'available', '道歉的力量', 'Aaron Lazare', '好人出版', '2022', '所謂的道歉不是完美無缺之和解，而是有沒有勇氣面對並接受。作者綜合上千項研究資料以及多年來觀察各領域關於「道歉」的成功與失敗案例，寫出關於「道歉學」最為平易近人的讀物。家庭、職場與社會中有無數個「道歉」與「原諒」的例子，文學、藝術裡也是。「道歉」的歷史早已存在百年以上，而現在我們終於真正重視它。這不只是一門專業心理諮商，而是所有人都需要學習的必修課。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42414/06d7973a-c67c-4d52-9d11-f4d26d1042d8@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42415', 113, 'available', '淤泥效應', 'Cass R. Sunstein', '天下文化', '2022', '繁文縟節、不必要的流程就是作者所謂的「淤泥效應」（sludge），在許多領域造成無效率，就像社會的慢性病，受害者有時是企業，有時是企業的員工或顧客，有時則是社會裡的弱勢群體，但最終危害的是整體社會。唯有減少淤泥效應的危害，才能讓公私立部門與組織更有競爭力！', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42415/7b587f14-4809-4147-9a06-77908780351d@710x470.jpg');
INSERT INTO books (id, selection_year, status, title, author, publisher, publish_year, description, cover) 
VALUES ('113-42416', 113, 'available', '最後一次相遇，我們只談喜悅', 'Dalai Lama, Desmond  Tutu等', '天下雜誌', '2022', '籌劃一年，以慶生為由，兩位深受全球景仰的心靈導師在印度達蘭薩拉相聚五天，這可能是一生最後一次的相見，但他們卻選擇毫無保留地回答來自全球上千個關於喜悅的問題。他們共同體認，人生無法免除必然的苦痛、心碎，但若能懷抱喜悅而活，即使遭遇困苦，也不會變冷酷；雖然心碎，也不會因而崩潰。快樂無法外求，喜悅是一種面對世界的生存方式。', 'https://ws.csptc.gov.tw/001/Upload/7/relpic/9223/42416/d9cee991-a2a1-4e82-b0dd-9d20d4b89b25@710x470.jpg');

-- Seed completed successfully!
