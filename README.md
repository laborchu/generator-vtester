# generator-vtester 

vtester是基于yeoman的generator，用于生成自动化测试项目结构和翻译uc文件成macaca执行文件

## 安装

```bash
npm install -g yo
npm install -g generator-vtester
```

然后生成项目:

```bash
yo vtester
```

## 名词说明

### uc
表示测试用例，如果出现在文件夹名称中，那说明该文件夹下面都是测试用例文件，如果出现在文件名，那该文件名是测试用例文件

### handler
表示处理者，测试用例中个别测试过程会比较复杂，比如判断ajax返回的数据是否是预期的数据等等，都有处理者来处理。如果出现在文件夹名称中，那说明该文件夹下面都是处理中文件，如果出现在文件名，那该文件名是测试用例文件

## 目录说明

```bash
projectName
|-src
	|-dist
	|-handler
	|-uc
|-test
```

###src
src里面包含项目使用的所有文件

####dist
在项目根目录，执行vtester:build子命令，会把uc文件夹下的文件转换成macaca执行文件到这里

####handler 和 uc
这里分别存放handler和uc文件，大量的测试代码都在这两个文件夹下面

##uc文件说明
uc文件是一个标准node模块文件

uc可以嵌套uc，下层uc是上层uc的子uc，叶子uc(没有子uc)可以包含paths，paths就是用例的执行路径，比如点击按钮-》输入标题-》点击提交等等一系列操作，每个path都可以包含一个checker，checker用于检查当前的path是否符合预期，比如点击提交按钮以后，可以检查一下是否有验证出现，简单结构如下：

```javascript
uc:{
	子uc:{
		paths:{
			checker:{
			}
		}
	}
}
```
完整的结构如下

**前面*表示必填，不是属性名的一部分**

```javascript
module.exports = {
	*title:'标题',
	build:true(缺省)|false,
	handler:true(缺省)|false,
	sleep:'停留时间',
	children:[
		{
			ucKey:'uc唯一表示',
			*title:'标题',
			preUc:'前置用例',
			sleep:'停留时间',
			paths:[
				{
					*title:'标题',
					*type:'url|click|input',
					url:'当type=url时必填',
					selector:'xpath|name|className',
					element:'selector值',
					value:'type=input的值'
					sleep:'停留时间',
					"checker":{
						"stop|eq|eqs|ajax":{
							title:'标题',
							selector:'xpath|name|className',
							element:'selector值',
							value:'check的值',
							url:'ajax专用',
							doer:'ajax专用',
							sleep:'停留时间'
						}
					}
				}
			]
		}
	]
}
```

###属性说明

####title

uc标题，或子uc标题或path标题或checker标题

####build
用于控制uc文件是否生成macaca执行文件到dist目录，true生成，false不生成，缺省true

####handler
用于控制是否对该uc文件生成handler文件，true生成，false不生成，缺省true

####sleep
停留时间，uc，path和checker都可以设置

####ucKey
每个uc都可以用这个属性唯一标示

####preUc
前置uc，配置了以后，会先执行该uc，再执行当前uc

####selector
页面元素筛选器类型，组件默认支持xpath,name,className

###element
筛选器的具体值

###path.type
path的类型，当前支持url，click和input

* url 调转到指定地址
* click 点击
* input 输入

###path.url
当path.type=url时跳转的url

###path.value
当path.type=input时输入的值

####checker
checker用于验证当前操作是否正确，当前自带有stop，eq，eqs，ajax

* stop 如果检验成功，则不会再执行后面的path
* eq 用于检验单个元素是否相等
* eqs 用于检验多个元素是否相等
* ajsx用于检验ajax返回的数据是否正确

####checker.value
通过selector和element跟该值进行比较

####checker.url
ajax执行的url

####checker.doer
ajax返回的结果处理者，在handler里面