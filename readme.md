### �e�X�g���쐬

###### Mac�̏ꍇ
- git ���C���X�g�[������
  - $ brew update
  - $ brew install git
- openJDK���C���X�g�[������
  - https://qiita.com/spaciba_h_t/items/c96e96be99596b0a9fe4
- leiningen ���C���X�g�[������  
  - brew install leiningen  

###### Windows�̏ꍇ
- git ���C���X�g�[������
  - https://qiita.com/toshi-click/items/dcf3dd48fdc74c91b409
- openJDK���C���X�g�[������
  - https://qiita.com/ryo-sato/items/87d05021fcc0519e8828
- leiningen���C���X�g�[������
  - https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein.bat �����[�J���Ƀ_�E�����[�h����
  - lein.bat self-install  
 �����s�̏ꍇ�Ahttps://github.com/technomancy/leiningen/releases/download/2.9.2/leiningen-2.9.2-standalone.zip ���蓮�_�E�����[�h���āAlein.bat �Ɠ����t�H���_�ɉ𓀂��Ă��������Blein.bat���݃t�H���_�̃p�X��ʂ�
  - �ڍׂ� http://antibayesian.hateblo.jp/entry/20120122/1327236946

### �N��
- git clone https://github.com/zheng-jiwei/ec-site-bigcommerce.git
- clone���ꂽ�t�H���_�[�Ɉړ�����
- `lein ring server-headless` �ŃT�[�o�[���N�����Ă��������B  
- �u���U�[�� `http://localhost:8080/index.html` ���A�N�Z�X������A�T�C�g�̕\�����ł��܂��B

***

### bigcommerce store�̐ݒ�
- �X�g�A�A�J�E���g�̍쐬
  - https://www.bigcommerce.com/essentials/free-trial
- API�A�J�E���g�쐬
�@- bigcommerce store�Ƀ��O�C��
  - �����̃��j���[ > Advanced Settings > API Accounts �ŉ�ʂ��J���āA�{�^���ucreate API account�v >  �ucreate v2/v3 API token�v���N���b�N����
  - �uOAuth Scopes�v�ɂ��鍀�ڂ͂��ׂčő匠����t�^���āimodify�������modify�A�Ȃ���� readonly�Alogin�Amanagement�Acreate�j�A�usave�v���N���b�N���܂��B
�@- �o�Ă������� config.json �ɂ���֘A����keyword�̒l�Ɠ���ւ�����ishop_cache��API PATH�̌�납��2�ԖڃZ�O�����g�̒l�ł��j
- �z���n��̐ݒ�
  - �Ǘ���ʍ����̃��j���[ > Store Setup > Shipping ���J���܂��B
  - Add shipping zone > add a country zone ���N���b�N���āA�C�ӂ̍���I������ submit ���܂��B
  - default shipping rules ���ɑI�����ꂽ�����o�Ă��āAconfigure���N���b�N���܂�
  - ship by ��ON�ɂ��āAdefault�� by weight ���\������āADefault shipping cost �ɔC�ӂ̐���������OK�ł��BRanges�G���A�͏d����Ԃ̑�����K���ɒǉ����āAsubmit�ŕۑ����܂��B
  - �z���n��͕����ǉ��ł��܂��B�ǉ����ꂽ���͒����̔z�����ʂɑI���ł��܂��B
  - Real-time shipping quotes�́AUPS��Fedex�ƌ_��K�v������A�e�X�g���Ă��܂���B
- �x�����̐ݒ�
  - �Ǘ���ʍ����̃��j���[ > Store Setup > Payments ���J���܂��B
  - Stripe ��ON�ɂ��āA�istripe �̃��O�C�����K�v�ł��jStripe Settings �� test mode ���`�F�b�N���� save ���܂��B
  - Stripe �̃A�J�E���g�쐬�́@https://dashboard.stripe.com/register�@����ł��܂��B�i�쐬���������s�����ȂǓ��͂��K�v�ł����A���̏�����͂ł����Ȃ������ł��j

***  

### ���i�o�^�ƃT�C�g��ʂ̔��f
- �f�t�H���g���i
  - �X�g�A�쐬�ɔ����āA�f�t�H���g��demo���i��13���A6�J�e�S��������܂��B
  - default ���i�̃I�v�V�������͖�肪����܂��i���݂��Ȃ�color��color�̑I�����ɏo�Ă���j�̂ŁA����̍ۃG���[�̉\��������܂��B
- ���i�o�^
  - �Ǘ���ʍ����̃��j���[�uproduct�v> �uadd�v�ŐV�K���i�o�^��ʂ��J��
  - �K�{�̍���(�u\*�v���Ă��鍀��)�݂̂ł������ł��̂ŁA���͏I�������usave�v���܂��B(Categories �̍��ڂ� Shop All �� Garden ��I������O��Ő������܂�)
  - �Ǘ���ʍ����̃��j���[�uproduct�v> �uproduct categories�v���J���āAgarden �J�e�S���̕ҏW��ʂɁuCategory Image�v��ǉ����Ă��������B
- ECSite�Ŋm�F
  - `http://localhost:8080/index.html` ���A�N�Z�X����
  - ![new prodcut](readme/new-product.jpg)
  - �J�e�S�� Garden ���N���b�N�����牺�L�̉�ʂ֑J�ڂ��܂��B
  - ![category with image](readme/category-with-img.jpg)


***
### �����@�\
- �g�b�v�y�[�W
![index](readme/index.jpg)

- �J�e�S���y�[�W
![category](readme/category.jpg)

- ���i�y�[�W
![prodcut](readme/product.jpg)

- �J�[�g�\���y�[�W
![cart](readme/cart.jpg)

- �Z�����̓y�[�W
![shipping](readme/shipping.jpg)

- �x���������̓y�[�W
![payment](readme/payment.jpg)

- ���������y�[�W
![complete](readme/end.jpg)

- ��������
![order list](readme/orderlist.jpg)

- ������O�C��
![login](readme/login.jpg)


***

### ���
- ���i��cart�ɓ��ꂽ��Acart���珤�i�����擾���鎞�ɏ��i�P���͏����_�Ȍオ����ꍇ�A���l���؂�グ��悤�ɂȂ�܂��B�i���i�P���͉~�̏ꍇ�̂݁A�ăh���̏ꍇ��肪����܂���j
- ���i��retail_price, price��sale_price�̒��ɁAgraphql�𗘗p����ꍇprice�̐��l�͐������Ȃ��ł��Bserver-to-server API�𗘗p����ꍇ�A���������܂����擾�����񂪑���Ȃ��Đ���bigcommerce�T�[�o�[��request����K�v������܂��̂ŁA���݂�graphql�̕��@�Ŏ������Ă��܂��B
- �����m��{�^�����N���b�N���āA�u"code"= 30102, "title"="The payment was declined."�v�G���[���o��ꍇ�A�������i�̐���ύX���čēx�����Ă��������B�i�����͊m�F���ł��j
